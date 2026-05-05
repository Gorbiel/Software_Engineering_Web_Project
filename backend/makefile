.PHONY: check-lint lint test

PYTHON := .venv/bin/python

check-lint:
	$(PYTHON) -m ruff check .
	$(PYTHON) -m black --check .

lint:
	$(PYTHON) -m ruff check . --fix
	$(PYTHON) -m black .

test:
	$(PYTHON) -m pytest

mock-db:
	python manage.py migrate
	python mock_data_create.py