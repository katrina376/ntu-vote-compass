# NTU Vote Compass

Developed by Katrina H.-Y. Chan ([katrina376](https://katrina.tw)).

[Papa Parse](https://github.com/mholt/PapaParse), [Showdown.js](https://github.com/showdownjs/showdown), and [Reset.css](http://meyerweb.com/eric/tools/css/reset/) are used in this project.

## Run

Two files are required in `assets/`:

- `test.md`: Configuring the core of the compass, including introductions and assessments. See more descriptions in `HOWTO.md` (WIP).
- `result.csv`: The dataset of the candidates. The first row contains the field names, including `name` and `number`, which are the required fields, and the key corresponding to the assessments in `test.md`.

The parameters in `index.html` (`path_to_test` and `path_to_result`) should be updated to the correct paths to the corresponding files in `assets/`.
