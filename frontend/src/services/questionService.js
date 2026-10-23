import api from './api';

const questionService = {
  list: (groupId) => api.get('/questions', { params: groupId ? { groupId } : {} }),
  get: (id) => api.get(`/questions/${id}`),
  create: (payload) => api.post('/questions', payload),
  update: (id, payload) => api.put(`/questions/${id}`, payload),
  delete: (id) => api.delete(`/questions/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/questions/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default questionService;
