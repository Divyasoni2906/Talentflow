import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { arrayMove } from '@dnd-kit/sortable';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: '/' }),
    tagTypes: ['Job', 'Candidate', 'Assessment'],
    endpoints: (builder) => ({
        // --- JOBS ---
        getJobs: builder.query({
            query: (args = {}) => {
                const { page = 1, search = '', status = 'all', pageSize = 10 } = args;
                return `jobs?page=${page}&search=${search}&status=${status}&pageSize=${pageSize}`;
            },
            providesTags: (result) =>
                result?.jobs
                    ? [ ...result.jobs.map(({ id }) => ({ type: 'Job', id })), { type: 'Job', id: 'LIST' } ]
                    : [{ type: 'Job', id: 'LIST' }],
        }),
        addJob: builder.mutation({
            query: (newJob) => ({ url: 'jobs', method: 'POST', body: newJob }),
            invalidatesTags: [{ type: 'Job', id: 'LIST' }],
        }),
        updateJob: builder.mutation({
            query: ({ id, ...patch }) => ({ url: `jobs/${id}`, method: 'PATCH', body: patch }),
            invalidatesTags: (r, e, { id }) => [{ type: 'Job', id }, { type: 'Job', id: 'LIST' }],
        }),
        reorderJobs: builder.mutation({
            query: ({ fromId, toId }) => ({ url: 'jobs/reorder', method: 'PATCH', body: { fromId, toId } }),
            invalidatesTags: [{ type: 'Job', id: 'LIST' }],
        }),

        // --- CANDIDATES ---
        getCandidates: builder.query({
            query: ({ search = '' } = {}) => `candidates?search=${search}`,
            providesTags: (result) =>
                result?.candidates
                    ? [ ...result.candidates.map(({ id }) => ({ type: 'Candidate', id })), { type: 'Candidate', id: 'LIST' } ]
                    : [{ type: 'Candidate', id: 'LIST' }],
        }),
         // NEW: Get a single candidate by ID
        getCandidateById: builder.query({
            query: (id) => `candidates/${id}`,
            providesTags: (result, error, id) => [{ type: 'Candidate', id }],
        }),
        // NEW: Get a candidate's timeline
        getCandidateTimeline: builder.query({
            query: (id) => `candidates/${id}/timeline`,
            providesTags: (result, error, id) => [{ type: 'CandidateTimeline', id }],
        }),
        updateCandidateStage: builder.mutation({
            query: ({ candidateId, newStage }) => ({ url: `candidates/${candidateId}`, method: 'PATCH', body: { stage: newStage } }),
            invalidatesTags: (r, e, { candidateId }) => [{ type: 'Candidate', id: 'LIST' }, { type: 'Candidate', id: candidateId }],
        }),

        // --- ASSESSMENTS ---
        getAssessment: builder.query({
            query: (jobId) => `assessments/${jobId}`,
            providesTags: (result, error, jobId) => [{ type: 'Assessment', id: jobId }],
        }),
        updateAssessment: builder.mutation({
            query: ({ jobId, structure }) => ({
                url: `assessments/${jobId}`,
                method: 'PUT',
                body: { structure },
            }),
            // This line was missing. It tells the app to refetch the assessment after saving.
            invalidatesTags: (result, error, { jobId }) => [{ type: 'Assessment', id: jobId }],
        }),
        submitAssessment: builder.mutation({
            query: ({ jobId, submission }) => ({
                url: `assessments/${jobId}/submit`,
                method: 'POST',
                body: submission,
            }),
        }),
    }),
});

export const {
    useGetJobsQuery, useAddJobMutation, useUpdateJobMutation, useReorderJobsMutation,
    useGetCandidatesQuery, useGetCandidateByIdQuery, useGetCandidateTimelineQuery, useUpdateCandidateStageMutation,
    useGetAssessmentQuery, useUpdateAssessmentMutation, useSubmitAssessmentMutation,
} = apiSlice;


