# DISABLED: this script pulls install.sh and release tags from a public
# GitHub repo (zyrahq/zyra) that does not exist / is not owned by this
# project. There is no public distribution of Zyra yet. Once one exists,
# update the URLs below (search for "zyrahq/zyra") and remove this guard.
echo "❌ This 1-click install script is disabled: there is no public Zyra distribution to pull from yet."
exit 1

pull_version=${VERSION:-$(curl -s https://api.github.com/repos/zyrahq/zyra/tags | grep '"name":' | head -n 1 | cut -d '"' -f 4)}

if [[ -z "$pull_version" ]]; then
  echo "Error: Unable to fetch the latest version tag. Please check your network connection or the GitHub API response."
  exit 1
fi
pull_branch=${BRANCH:-$pull_version}

version_num=${pull_version#v}
target_version="0.32.4"

# We moved the install script to a different location in v0.32.4
if [[ -n "$BRANCH" ]] || [[ "$(printf '%s\n' "$target_version" "$version_num" | sort -V | head -n1)" != "$version_num" ]]; then
  curl -sL "https://raw.githubusercontent.com/zyrahq/zyra/$pull_branch/packages/zyra-docker/scripts/install.sh" -o zyra_install.sh
else
  curl -sL "https://raw.githubusercontent.com/zyrahq/zyra/$pull_branch/install.sh" -o zyra_install.sh
fi

chmod +x zyra_install.sh
VERSION="$VERSION" BRANCH="$BRANCH" ./zyra_install.sh

rm zyra_install.sh
