# upload/

Drop new photographs here, commit, push. The build does the rest.

| Put JPEGs in            | They appear on |
|-------------------------|----------------|
| `upload/studies/`       | Studies        |
| `upload/projects/the-meadow/` | The Meadow |
| `upload/projects/empty-room/` | Empty Room |

File names don't matter — they're renumbered on from the highest existing
photograph in that set, then moved into `assets/images/…`. This folder is
emptied by the build, so it should be empty in the repository.

Upload the largest files you have: at least 2048px on the long side, so the
build can generate the full range of sizes. Nothing is ever upscaled.
