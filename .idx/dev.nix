{ pkgs, ... }: {
  channel = "stable-24.11";

  packages = [
    pkgs.nodejs_22
    pkgs.pnpm
  ];
env = {
  DATABASE_URL = "postgresql://neondb_owner:npg_NVq3Cdrpsmk6@ep-square-pine-am5t27d5-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
};
  idx = {
    extensions = [];

    workspace.onStart = {
      api-server = "cd /home/user/origine && pnpm --filter @workspace/api-server dev";
    };

    previews = {
      enable = true;
      previews = {
        web = {
          command = [
            "pnpm"
            "--prefix"
            "artifacts/lunar-mood"
            "exec"
            "vite"
            "--port"
            "$PORT"
            "--host"
            "0.0.0.0"
          ];
          manager = "web";
        };
      };
    };
  };
}