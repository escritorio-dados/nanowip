export type IBaseModal = { openModal: boolean; closeModal: () => void };

export type IReloadModal = IBaseModal & { reloadList: () => void };

export type IAddModal<T> = IBaseModal & { addList: (data: T) => void };

export type IUpdateModal<T> = IBaseModal & { updateList: (id: string, data: T) => void };

export type IDeleteModal = IBaseModal & { updateList: (id: string) => void };
