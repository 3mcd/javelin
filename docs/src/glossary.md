# Glossary

### Entity

An entity is and identifier for a discrete "thing" in a game. Each entity has its own unique set of components called a type.

### Component

A component is an identifier that can be added to or removed from an entity's type. An entity is fully defined by its type and its component values.

### Type

A type is a set of components that defines an entity's composition.

### Value component

A value component is a component that adds a JavaScript value (called component data) to an entity.

### Component data

Component data is a JavaScript value attached to an entity through a component.

### Component value

Same as component data.

### Tag component

A tag component is a component that does not add data to entities.

### World

A world is the container for all ECS data, including entities, entity types and component data, and resources.

### Resource

A resource a key that is used to get and set an arbitrary (non-entity related) value within a world. Used synonymously with [Resource value](#resource-value).

### Resource value

A resource value is a non-entity, non-component piece of game state added to the world through a resource.

### System

A system is a function that updates a world's entities and resources. Systems commonly use queries and monitors to implement game logic and react to entity composition changes.

### Query

A query is an iterable object that yields entities matching a set of query terms.

### Query term

A query term is any component, relation, or slot.

### Monitor

A monitor is a a query-like object that yields entities that began matching or no longer match an array of query terms.

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
