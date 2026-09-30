import api from './api';

const questionGroupService = {
  list: () => api.get('/question-groups'),
  get: (id) => api.get(`/question-groups/${id}`),
  create: (payload) => api.post('/question-groups', payload),
  update: (id, payload) => api.put(`/question-groups/${id}`, payload),
  delete: (id) => api.delete(`/question-groups/${id}`),
  updateStatus: (id, isActive) => api.patch(`/question-groups/${id}/status`, { isActive }),
  importJson: (payload) => api.post('/question-groups/import', payload),
  addQuestion: (groupId, payload) => api.post(`/question-groups/${groupId}/questions`, payload),
  updateQuestion: (groupId, questionId, payload) => api.put(`/question-groups/${groupId}/questions/${questionId}`, payload),
  deleteQuestion: (groupId, questionId) => api.delete(`/question-groups/${groupId}/questions/${questionId}`),
};

export default questionGroupService;
