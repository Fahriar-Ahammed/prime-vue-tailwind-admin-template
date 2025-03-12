export const formatDate = (value) => {
    if (value) {
        return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return '';
};