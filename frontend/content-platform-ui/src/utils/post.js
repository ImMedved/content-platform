export function normalizePostDetail(data) {
    if (!data?.post) {
        return null;
    }

    return {
        ...data.post,
        content: Array.isArray(data.content) ? data.content : [],
        access: data.access || null
    };
}
