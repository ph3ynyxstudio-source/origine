{ pkgs, ... }: {
  # 1. On règle l'erreur Node en forçant une version récente
  channel = "stable-24.11"; 

  packages = [
    pkgs.nodejs_22
    pkgs.pnpm
  ];

  # 2. Le plan de l'autre Gemini pour lancer l'application
  idx = {
    extensions = [];
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