/*
Comment item
*/

function CommentItem({ comment, actions = null }) {
    return (
        <div className="comment-item">
            <div className="comment-item__meta">
                <span className="comment-item__author">
                    {comment.authorName || comment.author_username || `User #${comment.author_id ?? ""}`}
                </span>
                <span>{comment.created_at ? new Date(comment.created_at).toLocaleString() : ""}</span>
            </div>

            <div className="comment-item__text">{comment.content}</div>
            {actions && <div className="comment-item__actions">{actions}</div>}
        </div>
    );
}

export default CommentItem;
