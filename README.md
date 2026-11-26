# VersionBack

A small, responsive release-history app. Add version labels and release notes, see which version is marked active, and mark a saved earlier version as active again.

## Run it

Open `index.html` in a modern browser. No build step or dependencies are required. The app stores its data in that browser's `localStorage`.

## Important limitation

This is a local release tracker/prototype. Marking a version active only changes the record in this browser; it does not restore files, install a prior build, or roll back a live deployment. To automate real rollbacks, the next step is to connect this interface to your source control and deployment platform (for example, GitHub Actions, a hosting provider, or a package registry) with appropriate authentication and safeguards.
