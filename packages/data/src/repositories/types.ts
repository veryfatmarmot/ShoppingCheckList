export type RepositoryUserId = string;
export type RepositorySubscription<T> = (items: T[]) => void;
export type RepositoryUnsubscribe = () => void;
