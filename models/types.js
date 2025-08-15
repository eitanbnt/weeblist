// weeblist/models/types.js

// Define the data models for the application
// These classes represent the structure of the data used in the application
export class Collection {
    constructor({ id, title, type, progress }) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.progress = progress;
    }
}
// Define the Work class to represent a work item in the application
// This class includes properties such as id_work, title, type, and various progress metrics
export class Work {
    constructor({ id_work, title, type, total_episodes, total_chapters, total_volumes }) {
        this.id_work = id_work;
        this.title = title;
        this.type = type;
        this.total_episodes = total_episodes;
        this.total_chapters = total_chapters;
        this.total_volumes = total_volumes;
    }
}
// Define the CollectionWork class to represent the relationship between a collection and a work
// This class includes properties such as id, id_collection, id_work, and progress_absolute
export class CollectionWork {
    constructor({ id, id_collection, id_work, progress_absolute }) {
        this.id = id;
        this.id_collection = id_collection;
        this.id_work = id_work;
        this.progress_absolute = progress_absolute;
    }
}
