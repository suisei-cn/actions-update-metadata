const core = require("@actions/core");
const fs = require("fs");

function findAndReturnJSON(text) {
  return JSON.parse(
    text.replace(/[\n\r ]+```[\n\r ]+/g, "```").match(/```([\w\W]*)```/)[1]
  );
}

function findUserName(text) {
  const match = text.match(/@([\w-_]+)/);
  if (match && match.length > 1) {
    return match[1];
  } else {
    return core.getInput("default-username") || "librehsbot";
  }
}

function main() {
  try {
    const comment = core.getInput("comment");
    const target = core.getInput("target");
    let to_insert = {};
    try {
      to_insert = findAndReturnJSON(comment);
    } catch (e) {
      core.setFailed(`Can't find JSON in the comment: ${e}`);
      return;
    }
    let old_content = [];
    try {
      const content = fs.readFileSync(target, "utf-8");
      old_content = JSON.parse(content);
    } catch (e) {
      core.setFailed(`Can't find or parse target JSON at ${target}: ${e}`);
    }
    old_content.push(to_insert);
    fs.writeFileSync(target, JSON.stringify(old_content, null, 4));
    core.setOutput("username", findUserName(comment));
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
