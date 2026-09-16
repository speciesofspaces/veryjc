# upload/

Drop new photographs here, commit, push. The build does the rest.

| Put JPEGs in            | They appear on |
|-------------------------|----------------|
| `upload/studies/`       | Studies        |
| `upload/projects/the-meadow/` | The Meadow |
| `upload/projects/species-of-spaces/` | Species of Spaces |
| `upload/projects/margins/` | Margins |
| `upload/projects/photo-poetry/` | Photo Poetry (the front page) |
| `upload/projects/haiku/` | Haiku |

File names don't matter — they're renumbered on from the highest existing
photograph in that set, then moved into `assets/images/…`. This folder is
emptied by the build, so it should be empty in the repository.

A project page is generated from whatever is in its folder, so uploading the
first photographs to a new project is all it takes to bring its page to life —
nothing in the HTML needs editing.

Upload the largest files you have: at least 2048px on the long side, so the
build can generate the full range of sizes. Nothing is ever upscaled.
