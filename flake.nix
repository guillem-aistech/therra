{
  description = "Therra — TanStack Start MVP development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        isLinux = pkgs.stdenv.isLinux;

        # NixOS only: Playwright Chromium dependencies for nix-ld
        # Based on: https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/registry/nativeDeps.ts
        playwrightLibs = pkgs.lib.makeLibraryPath (with pkgs; [
          # C++ runtime
          stdenv.cc.cc.lib
          # X11
          xorg.libX11
          xorg.libXcomposite
          xorg.libXdamage
          xorg.libXext
          xorg.libXfixes
          xorg.libXrandr
          xorg.libxcb
          # Graphics
          mesa
          libdrm
          # Input
          libxkbcommon
          # Wayland
          wayland
          # Audio
          alsa-lib
          # Accessibility
          at-spi2-atk
          at-spi2-core
          # System
          cups
          dbus
          glib
          nspr
          nss
          # UI/Fonts
          gtk3
          pango
          cairo
          fontconfig
          freetype
        ]);
        nixLdPath = pkgs.lib.fileContents "${pkgs.stdenv.cc}/nix-support/dynamic-linker";
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Development tools
            nodejs_24
            typescript
            pnpm        # self-manages to the version pinned in package.json "packageManager"
            biome       # linting & formatting
          ];

          shellHook = ''
            echo "🚀 Therra Development Environment"
            echo "Node.js $(node --version)"
            echo "TypeScript $(tsc --version)"
            echo "pnpm $(pnpm --version)"
            echo "Biome $(biome --version)"
            echo ""

            ${if isLinux then ''
            # NixOS only: Set up nix-ld for Playwright browsers
            if [ -e /etc/NIXOS ]; then
              export NIX_LD_LIBRARY_PATH="${playwrightLibs}"
              export NIX_LD="${nixLdPath}"
              # Warn if nix-ld is not enabled
              if [ ! -e /lib64/ld-linux-x86-64.so.2 ] && [ ! -e /lib/ld-linux-x86-64.so.2 ]; then
                echo "⚠️  NixOS detected but nix-ld not enabled. Playwright tests will fail."
                echo "   Add to your NixOS config: programs.nix-ld.enable = true;"
                echo ""
              fi
            fi
            '' else ""}
          '';

          # Set environment variables
          NODE_ENV = "development";
        };
      });
}
