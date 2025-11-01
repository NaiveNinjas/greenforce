export function formetWorkflowTitle(str) {
    if (!str) return '';
    return str
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}