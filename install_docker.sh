#!/usr/bin/env bash
set -e

if [ "$EUID" -ne 0 ]; then
    echo "Please run as root: sudo ./install_docker.sh"
    exit 1
fi

echo "Installing Docker on Arch Linux..."
pacman -Sy --noconfirm docker docker-compose

echo "Enabling and starting Docker service..."
systemctl enable --now docker

echo "Adding current user to docker group..."
REAL_USER="${SUDO_USER:-$USER}"
usermod -aG docker "$REAL_USER"

echo ""
echo "Docker installed successfully."
docker --version
echo ""
echo "NOTE: Log out and back in (or run 'newgrp docker') for group changes to take effect."
