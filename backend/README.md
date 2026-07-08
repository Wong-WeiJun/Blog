# BlogSite Backend

FastAPI backend for the BlogSite developer blog. Provides RESTful APIs for posts, users, comments, contact forms, file uploads, and an RSS feed.

## Requirements

- [Docker](https://www.docker.com/)
- [uv](https://docs.astral.sh/uv/) for Python package and environment management

## Quickstart

```bash
# Install dependencies
uv sync

# Run tests
bash scripts/test.sh

# Start the dev server (inside Docker or locally with `fastapi run --reload`)
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── feed.py       # RSS feed generation
│   │   │   ├── posts.py      # Blog post CRUD
│   │   │   ├── contact.py    # Contact form submissions
│   │   │   ├── uploads.py    # File uploads (avatars, covers)
│   │   │   └── users.py      # User management
│   │   └── deps.py           # Dependency injection (DB session, current user)
│   ├── core/
│   │   ├── config.py         # Settings and environment variables
│   │   ├── db.py             # Database engine and session
│   │   └── security.py       # Password hashing, JWT, tokens
│   ├── crud.py               # CRUD utilities for all models
│   ├── models.py             # SQLModel data models (User, Post, Comment, etc.)
│   └── main.py               # FastAPI app factory and startup
├── tests/                    # Pytest test suite
└── scripts/
    ├── prestart.sh           # DB migration and initial data
    └── test.sh               # Test runner
```

## Key Features

### Blog Posts
- Full CRUD for posts with drafts and publishing.
- Posts support markdown content, excerpts, cover images, and tags.
- Public feed at `/feed.xml` (RSS 2.0).

### Contact
- Contact form submissions stored in the database.
- Admin notification emails triggered on new submissions.

### Uploads
- Image uploads for user avatars and post cover images.
- Supports S3/MinIO via `boto3`.

### Auth
- JWT-based authentication.
- Role-based access control (admin vs regular users).

## Docker Compose

Start the local development environment with Docker Compose following the guide in [../development.md](../development.md).

By default, the dependencies are managed with [uv](https://docs.astral.sh/uv/), go there and install it.

From `./backend/` you can install all the dependencies with:

```console
$ uv sync
```

Then you can activate the virtual environment with:

```console
$ source .venv/bin/activate
```

Make sure your editor is using the correct Python virtual environment, with the interpreter at `backend/.venv/bin/python`.

## Backend Tests

To test the backend run:

```console
$ bash ./scripts/test.sh
```

The tests run with Pytest, modify and add tests to `./backend/tests/`.

If you use GitHub Actions the tests will run automatically.

### Test running stack

If your stack is already up and you just want to run the tests, you can use:

```bash
docker compose exec backend bash scripts/tests-start.sh
```

That `/app/scripts/tests-start.sh` script just calls `pytest` after making sure that the rest of the stack is running. If you need to pass extra arguments to `pytest`, you can pass them to that command and they will be forwarded.

For example, to stop on first error:

```bash
docker compose exec backend bash scripts/tests-start.sh -x
```

### Test Coverage

When the tests are run, a file `htmlcov/index.html` is generated, you can open it in your browser to see the coverage of the tests.

## Migrations

As during local development your app directory is mounted as a volume inside the container, you can also run the migrations with `alembic` commands inside the container and the migration code will be in your app directory (instead of being only inside the container). So you can add it to your git repository.

Make sure you create a "revision" of your models and that you "upgrade" your database with that revision every time you change them. As this is what will update the tables in your database. Otherwise, your application will have errors.

* Start an interactive session in the backend container:

```console
$ docker compose exec backend bash
```

* Alembic is already configured to import your SQLModel models from `./backend/app/models.py`.

* After changing a model (for example, adding a column), inside the container, create a revision, e.g.:

```console
$ alembic revision --autogenerate -m "Add column last_name to User model"
```

* Commit to the git repository the files generated in the alembic directory.

* After creating the revision, run the migration in the database (this is what will actually change the database):

```console
$ alembic upgrade head
```

If you don't want to use migrations at all, uncomment the lines in the file at `./backend/app/core/db.py` that end in:

```python
SQLModel.metadata.create_all(engine)
```

and comment the line in the file `scripts/prestart.sh` that contains:

```console
$ alembic upgrade head
```

If you don't want to start with the default models and want to remove them / modify them, from the beginning, without having any previous revision, you can remove the revision files (`.py` Python files) under `./backend/app/alembic/versions/`. And then create a first migration as described above.

## Email Templates

The email templates are in `./backend/app/email-templates/`. Here, there are two directories: `build` and `src`. The `src` directory contains the source files that are used to build the final email templates. The `build` directory contains the final email templates that are used by the application.

Before continuing, ensure you have the [MJML extension](https://github.com/mjmlio/vscode-mjml) installed in your VS Code.

Once you have the MJML extension installed, you can create a new email template in the `src` directory. After creating the new email template and with the `.mjml` file open in your editor, open the command palette with `Ctrl+Shift+P` and search for `MJML: Export to HTML`. This will convert the `.mjml` file to a `.html` file and now you can save it in the build directory.
