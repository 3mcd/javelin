# Glossary

### Entity

An entity is a discrete "thing" in a game. Each entity has its own set of unique components.

### Component

A component is an identifier that can be added to or removed from an entity's set of components. All entity information is stored in an entity's component signature and component values.

### Value component

A value component is a component that adds a JavaScript value (called a component value) to an entity.

### Component value

A component value is a JavaScript data type (like a number, string, or object) attached to an entity through a value component.

### Tag component

A tag component is a component that does not add additional data to entities. Queries may execute logic based on the presence or absense of a tag component.

### World

A world is the container for all ECS data, including entities, their components, and resources.

### Resource

A resource is an integer that functions as a key to get and set a resource value in a world.

### Resource value

A resource value is a non-entity, non-component piece of game state added to the world through a resource.

### System

A system is a function that updates a world's entities and resources. Systems commonly use queries and monitors to implement game logic and react to entity composition changes.

### Query

A query is an object that resolves a world's entities that match a set of query terms.

### Query term

A query term can be a tag component, value component, relation tag, relationship component, slot tag, or slot component.

### Monitor

A monitor is a a query-like object that yields a world's entities that started or stopped matching an array of query terms.

### Relation

A relation is a function that returns per-entity relationship components. Relations are subsituted in types with their underlying relation tag. 

### Relation tag

A relation tag is a tag component automatically given to relations. They provide the means to find all entities with associated relationships.

For example, `world.of(ChildOf)` would find all entities that are a child of another entity.

### Relationship component

A relationship component is the product of calling a relation with an entity. For example, `ChildOf(parent)` creates a relationship component for the entity `parent`. When added to an entity, a relation component asserts that it's entity and the entity to which it is being added are related in some way.

### Slot

A slot is a function that builds slot components. Slots are defined with a fixed set of components. A slot can only produce slot components for the components it was defined with.

### Slot tag

A slot tag is a tag component automatically given to slots. Slots are subsituted in types with their underlying slot tags. For example, `world.of(MovementState)` would find all entities with a `MovementState`.

### Slot component

A slot component is the product of calling a slot with a component. For example, `MovementState(Running)` creates a slot component for the component `Running`. When added to an entity, a slot component asserts that it's entity may have only one slot component of the given slot.
