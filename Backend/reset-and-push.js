import git from "isomorphic-git";
import fs from "fs";
import http from "isomorphic-git/http/node";

const dir = "f:\\Agency CLients works\\Visvam";

async function resetAndPush() {
  try {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GH_TOKEN environment variable missing.");
    }

    console.log("Fetching remote info from origin...");
    const info = await git.getRemoteInfo({
      http,
      url: "https://github.com/AshishNith/visvam-harvest.git",
    });

    const remoteMainSha = info.refs?.heads?.main;
    console.log(`Remote origin main SHA is: ${remoteMainSha}`);

    if (remoteMainSha) {
      console.log("Setting local main branch to remote origin main SHA...");
      await git.writeRef({
        fs,
        dir,
        ref: "refs/heads/main",
        value: remoteMainSha,
        force: true,
      });
    }

    console.log("Staging modified & new files...");
    const matrix = await git.statusMatrix({ fs, dir });
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

    console.log(`Staged ${changedCount} file changes cleanly.`);

    console.log("Creating fresh clean commit...");
    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: "Visvam Developer",
        email: "dev@visvamharvest.com",
      },
      message: "feat: add MongoDB Express backend, upgrade navbar with official logos, and apply seamless button redesign",
    });

    console.log(`Clean commit created! SHA: ${sha}`);

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

    console.log("SUCCESS! Push completed successfully!", pushResult);
  } catch (error) {
    console.error("Reset and push error:", error);
  }
}

resetAndPush();
