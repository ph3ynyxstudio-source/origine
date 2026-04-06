import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceDir = path.resolve(artifactDir, "../..");
const esbuildBin = path.resolve(
  workspaceDir,
  "node_modules/.pnpm/esbuild@0.27.3/node_modules/esbuild/bin/esbuild",
);
const banner = `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`;

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  const args = [
    esbuildBin,
    path.resolve(artifactDir, "src/index.ts"),
    "--bundle",
    "--platform=node",
    "--format=esm",
    `--outdir=${distDir}`,
    "--out-extension:.js=.mjs",
    "--log-level=info",
    "--sourcemap=linked",
    `--banner:js=${banner}`,
    // Keep pino runtime packages external to avoid the plugin path and the native
    // esbuild child-process path that is failing under Windows.
    "--external:pino",
    "--external:pino/*",
    "--external:pino-http",
    "--external:pino-pretty",
    "--external:thread-stream",
    "--external:thread-stream/*",
    // Some packages may not be bundleable, so we externalize them, we can add more here as needed.
    // Examples of unbundleable packages:
    // - uses native modules and loads them dynamically (e.g. sharp)
    // - use path traversal to read files (e.g. @google-cloud/secret-manager loads sibling .proto files)
    "--external:*.node",
    "--external:sharp",
    "--external:better-sqlite3",
    "--external:sqlite3",
    "--external:canvas",
    "--external:bcrypt",
    "--external:argon2",
    "--external:fsevents",
    "--external:re2",
    "--external:farmhash",
    "--external:xxhash-addon",
    "--external:bufferutil",
    "--external:utf-8-validate",
    "--external:ssh2",
    "--external:cpu-features",
    "--external:dtrace-provider",
    "--external:isolated-vm",
    "--external:lightningcss",
    "--external:pg-native",
    "--external:oracledb",
    "--external:mongodb-client-encryption",
    "--external:nodemailer",
    "--external:handlebars",
    "--external:knex",
    "--external:typeorm",
    "--external:protobufjs",
    "--external:onnxruntime-node",
    "--external:@tensorflow/*",
    "--external:@prisma/client",
    "--external:@mikro-orm/*",
    "--external:@grpc/*",
    "--external:@swc/*",
    "--external:@aws-sdk/*",
    "--external:@azure/*",
    "--external:@opentelemetry/*",
    "--external:@google-cloud/*",
    "--external:@google/*",
    "--external:googleapis",
    "--external:firebase-admin",
    "--external:@parcel/watcher",
    "--external:@sentry/profiling-node",
    "--external:@tree-sitter/*",
    "--external:aws-sdk",
    "--external:classic-level",
    "--external:dd-trace",
    "--external:ffi-napi",
    "--external:grpc",
    "--external:hiredis",
    "--external:kerberos",
    "--external:leveldown",
    "--external:miniflare",
    "--external:mysql2",
    "--external:newrelic",
    "--external:odbc",
    "--external:piscina",
    "--external:realm",
    "--external:ref-napi",
    "--external:rocksdb",
    "--external:sass-embedded",
    "--external:sequelize",
    "--external:serialport",
    "--external:snappy",
    "--external:tinypool",
    "--external:usb",
    "--external:workerd",
    "--external:wrangler",
    "--external:zeromq",
    "--external:zeromq-prebuilt",
    "--external:playwright",
    "--external:puppeteer",
    "--external:puppeteer-core",
    "--external:electron",
  ];

  execFileSync(process.execPath, args, {
    cwd: artifactDir,
    stdio: "inherit",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
