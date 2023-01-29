# Design Overview

Entities in Javelin are stored in a graph separate from their component values. Entities are sorted into nodes based on their current component makeup (or composition).

Each [value component](./components.md#value-components) is allocated an array where its values are stored.

Systems create queries that search the entity graph for matching components. Queries then fetch component values of interest by accessing the entity's index in the corresponding storage array.

## Architecture Diagram

Below is a diagram that illustrates the storage and retrieval of entities and components by systems.

![Javelin architecture diagram](images/design.png)
