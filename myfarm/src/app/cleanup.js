const fs = require('fs');
const path = require('path');
const { Project, SyntaxKind } = require('ts-morph');

function toSentence(camelCase) {
  let result = camelCase.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
}

function processHtmlCss(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processHtmlCss(fullPath);
    } else {
      if (fullPath.endsWith('.html')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/<!--[\s\S]*?-->/g, '');
        fs.writeFileSync(fullPath, content);
      } else if (fullPath.endsWith('.css')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/\/\*[\s\S]*?\*\//g, '');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

async function processTs() {
  const project = new Project();
  project.addSourceFilesAtPaths("**/*.ts");
  
  const sourceFiles = project.getSourceFiles().filter(f => !f.getFilePath().endsWith('.spec.ts'));
  
  for (const sourceFile of sourceFiles) {
    // We want to remove all existing comments.
    // Instead of complex AST walking for every comment, regex stripping of // and /* */ could work if careful,
    // but doing it via TS Morph is safer if we just remove JSDocs, and maybe we can use regex for // on lines that only contain //
    
    let content = sourceFile.getFullText();
    // Remove lines that are just // comments
    content = content.replace(/^\s*\/\/.*$/gm, '');
    sourceFile.replaceWithText(content);
    
    sourceFile.getClasses().forEach(c => {
      c.getJsDocs().forEach(j => j.remove());
      c.getMethods().forEach(m => {
        m.getJsDocs().forEach(j => j.remove());
        
        const name = m.getName();
        let desc = "Handles the " + toSentence(name) + " functionality.";
        if (name === 'ngOnInit') desc = "Initializes the component.";
        else if (name.startsWith('get')) desc = "Retrieves the " + toSentence(name.substring(3)).trim() + ".";
        else if (name.startsWith('set')) desc = "Sets the " + toSentence(name.substring(3)).trim() + ".";
        else if (name.startsWith('navigate')) desc = "Navigates to " + toSentence(name.substring(8)).trim() + ".";
        else if (name.startsWith('on')) desc = "Handles the " + toSentence(name.substring(2)).trim() + " event.";
        else if (name === 'constructor') desc = "Instantiates the component.";
        
        m.addJsDoc({ description: desc });
      });
      c.getConstructors().forEach(ctor => {
        ctor.getJsDocs().forEach(j => j.remove());
        ctor.addJsDoc({ description: "Instantiates the component and injects dependencies." });
      });
      c.getProperties().forEach(p => {
        p.getJsDocs().forEach(j => j.remove());
      });
    });
    
    sourceFile.getFunctions().forEach(f => {
      f.getJsDocs().forEach(j => j.remove());
      const name = f.getName() || "function";
      f.addJsDoc({ description: "Executes the " + toSentence(name).trim() + " logic." });
    });
    
    sourceFile.saveSync();
  }
}

processHtmlCss(__dirname);
processTs().then(() => console.log('Done TS'));
