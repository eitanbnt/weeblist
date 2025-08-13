export class Collection {
    constructor({ id, title, type, progress }) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.progress = progress;
    }
}

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

export class CollectionWork {
    constructor({ id, id_collection, id_work, progress_absolute }) {
        this.id = id;
        this.id_collection = id_collection;
        this.id_work = id_work;
        this.progress_absolute = progress_absolute;
    }
}
