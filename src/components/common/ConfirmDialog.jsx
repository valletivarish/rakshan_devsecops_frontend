/**
 * ConfirmDialog.jsx - Reusable Modal Confirmation Dialog Component
 *
 * Displays a modal overlay with a confirmation message and two action
 * buttons (confirm and cancel). Used when the user is about to perform
 * a destructive or irreversible action such as deleting a submission
 * or removing a review dimension.
 *
 * The dialog is controlled by the parent component through the `isOpen`
 * prop. When open, it renders a semi-transparent backdrop that blocks
 * interaction with the page behind it and centres the dialog card.
 *
 * Usage:
 *   <ConfirmDialog
 *     isOpen={showConfirm}
 *     title="Delete Submission"
 *     message="Are you sure you want to delete this submission? This action cannot be undone."
 *     confirmLabel="Delete"
 *     cancelLabel="Cancel"
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowConfirm(false)}
 *   />
 */

import React from 'react';

/**
 * ConfirmDialog - Modal confirmation dialog with confirm and cancel actions.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is visible
 * @param {string} [props.title='Confirm Action'] - Dialog heading text
 * @param {string} [props.message='Are you sure you want to proceed?'] - Descriptive message
 * @param {string} [props.confirmLabel='Confirm'] - Text for the confirm button
 * @param {string} [props.cancelLabel='Cancel'] - Text for the cancel button
 * @param {Function} props.onConfirm - Callback invoked when the user confirms
 * @param {Function} props.onCancel - Callback invoked when the user cancels
 * @param {boolean} [props.isDanger=true] - Whether to style the confirm button as danger
 * @returns {JSX.Element|null} The dialog UI or null when closed
 */
function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = true,
}) {
  /* Do not render anything when the dialog is closed */
  if (!isOpen) {
    return null;
  }

  return (
    /* Backdrop overlay - clicking it triggers cancel to close the dialog */
    <div
      className="confirm-dialog-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      {/*
       * Dialog card - stopPropagation prevents clicks inside the card
       * from triggering the backdrop's onClick (which would close it).
       */}
      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '90%',
          padding: 'var(--space-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        {/* Dialog title */}
        <h3
          id="confirm-dialog-title"
          style={{
            fontSize: 'var(--font-lg)',
            fontWeight: 600,
            marginBottom: 'var(--space-md)',
          }}
        >
          {title}
        </h3>

        {/* Descriptive message explaining the action */}
        <p
          id="confirm-dialog-message"
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-sm)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-xl)',
          }}
        >
          {message}
        </p>

        {/* Action buttons: Cancel (secondary) and Confirm (danger or primary) */}
        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
