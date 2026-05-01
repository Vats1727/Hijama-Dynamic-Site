import api from './api';

const crudService = {
  getAll: async (slug) => {
    const res = await api.get(`/${slug}`);
    return res.data;
  },
  getOne: async (slug, id) => {
    const res = await api.get(`/${slug}/${id}`);
    return res.data;
  },
  create: async (slug, data) => {
    const res = await api.post(`/${slug}`, data);
    return res.data;
  },
  update: async (slug, id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const res = await api.post(`/${slug}/${id}`, data);
      return res.data;
    }
    const res = await api.put(`/${slug}/${id}`, data);
    return res.data;
  },
  delete: async (slug, id) => {
    const params = new URLSearchParams();
    params.append('_method', 'DELETE');
    const res = await api.post(`/${slug}/${id}`, params);
    return res.data;
  }
};

export { crudService };
