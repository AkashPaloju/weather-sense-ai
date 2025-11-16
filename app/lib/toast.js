// app/lib/toast.js
// Simple toast notification helper (no external dependencies)

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-16 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'info', duration = 3000) {
  const container = getToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `
    px-4 py-3 rounded-lg shadow-lg border transform transition-all duration-300 ease-out
    flex items-center gap-2 max-w-sm animate-slide-in
    ${type === 'success' ? 'bg-green-200 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-900 dark:text-green-200' : ''}
    ${type === 'error' ? 'bg-red-200 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200' : ''}
    ${type === 'info' ? 'bg-blue-200 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200' : ''}
  `.trim();
  
  // Inline fallback colors in case Tailwind utilities aren't applied/missing
  if (type === 'success') {
    toast.style.backgroundColor = toast.style.backgroundColor || '#dcfce7'; // green-100 fallback
    toast.style.color = toast.style.color || '#065f46'; // green-800 fallback
    toast.style.borderColor = toast.style.borderColor || '#86efac';
  } else if (type === 'error') {
    toast.style.backgroundColor = toast.style.backgroundColor || '#fee2e2'; // red-100
    toast.style.color = toast.style.color || '#7f1d1d'; // red-800
    toast.style.borderColor = toast.style.borderColor || '#fca5a5';
  } else {
    toast.style.backgroundColor = toast.style.backgroundColor || '#dbeafe'; // blue-100
    toast.style.color = toast.style.color || '#1e3a8a'; // blue-800
    toast.style.borderColor = toast.style.borderColor || '#93c5fd';
  }

  // Icon based on type
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <span class="text-lg font-semibold">${icons[type] || icons.info}</span>
    <span class="text-sm font-medium">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, duration);
}

// Add animation styles to document if not present
if (typeof window !== 'undefined' && !document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}
