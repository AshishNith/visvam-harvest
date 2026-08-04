import git from "isomorphic-git";
import fs from "fs";
import http from "isomorphic-git/http/node";

const dir = "f:\\Agency CLients works\\Visvam";

async function runGitProcess() {
  try {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GH_TOKEN environment variable is not set.");
    }

    console.log("Checking Git status matrix...");
    const matrix = await git.statusMatrix({ fs, dir });
    
    console.log("Staging modified & new files...");
    let changedCount = 0;
    for (const [filepath, headStatus, workdirStatus, stageStatus] of matrix) {
      if (filepath.startsWith(".git/") || filepath.startsWith("node_modules/") || filepath.startsWith("Backend/node_modules/")) continue;
      
      if (workdirStatus === 0) {
        await git.remove({ fs, dir, filepath });
        console.log(`[Git Remove] ${filepath}`);
        changedCount++;
      } else if (workdirStatus === 2 || workdirStatus === 1) {
        await git.add({ fs, dir, filepath });
        console.log(`[Git Add] ${filepath}`);
        changedCount++;
      }
    }

    console.log(`Staged ${changedCount} file changes.`);

    console.log("Creating commit...");
    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: "Visvam Developer",
        email: "dev@visvamharvest.com",
      },
      message: "feat: add MongoDB Express backend, upgrade navbar with official logos, and apply seamless button redesign",
    });

    console.log(`Commit created successfully! SHA: ${sha}`);

    console.log("Pushing to GitHub remote origin main...");
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: "origin",
      ref: "main",
      onAuth: () => ({
        username: token,
      }),
    });

    console.log("Push completed successfully!", pushResult);
  } catch (error) {
    console.error("Git helper error:", error);
  }
}

runGitProcess();
