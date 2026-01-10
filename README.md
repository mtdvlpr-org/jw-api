# JW API

**JW API** is a robust and comprehensive interface for accessing data related to JW.org services. It provides a unified way to retrieve information about publications, media, languages, and daily texts, serving as a bridge to various underlying data sources.

## Overview

This application acts as a central API gateway that simplifies interaction with:

- **Mediator**: Access detailed categorization, media items, and translation data.
- **WOL (Watchtower Online Library)**: Retrieve daily texts and year texts programmatically.
- **Publication Media**: Fetch metadata and links for various publications.
- **Bible Data**: Access Bible books and verse data.

In addition to standard REST endpoints, this project includes a **Model Context Protocol (MCP)** server, enabling AI agents to directly query JW-related data (like Bible verses and transcripts) for enhanced context.

## Key Features

- **RESTful API**: Clean and structured endpoints for querying data.
- **Multi-Language Support**: robust handling of language codes and translations.
- **Media Integration**: Easy access to media items and publication details.
- **AI Ready**: Built-in MCP server for integrating with AI assistants.
- **Modern Tech Stack**: Built on Nuxt 4, ensuring high performance and type safety.

## Getting Started (For Users)

This is an API service. If you have the service running (locally or hosted), you can interact with it via HTTP requests.

For detailed API documentation including all endpoints, request/response formats, and examples, see [server/api/README.md](server/api/README.md).

### Quick Start Examples

Assuming the API is running at `http://localhost:3000`:

- **Get Year Text**:
    ```bash
    curl "http://localhost:3000/api/v1/wol/yeartext?wtlocale=E&year=2026"
    ```

- **Get Bible Verse** (Genesis 1:1):
    ```bash
    curl http://localhost:3000/api/v1/bible/en/1/1/1
    ```

- **Get Languages**:
    ```bash
    curl http://localhost:3000/api/v1/mediator/languages/E
    ```

- **Get Publication Media**:
    ```bash
    curl "http://localhost:3000/api/v1/pub-media/publication?pub=mwb&langwritten=E&issue=202401"
    ```

### Interactive Documentation

- **Swagger UI**: http://localhost:3000/_docs/swagger
- **Scalar**: http://localhost:3000/_docs/scalar
- **OpenAPI Spec**: http://localhost:3000/_docs/openapi.json

## Developers

If you are a developer looking to contribute, modify, or run this project locally, please refer to the [Contributing Guide](CONTRIBUTING.md).

It covers:

- Setup and Installation
- Development Workflow
- Testing and Linting
- Coding Standards

## License

This project is licensed under the MIT OR Apache-2.0 License. See [LICENSE](LICENSE) for details.
