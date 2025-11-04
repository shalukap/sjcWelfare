import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export const confirm = (options = {}) => {
  return Swal.fire({
    title: options.title || 'Are you sure?',
    text: options.text || '',
    icon: options.icon || 'warning',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Yes',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    reverseButtons: options.reverseButtons ?? true,
  });
};

export const success = (title = 'Success', text = '', opts = {}) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer: opts.timer ?? 1800,
    showConfirmButton: opts.showConfirmButton ?? false,
    ...opts.swalOptions,
  });
};

export const error = (title = 'Error', text = '', opts = {}) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    showConfirmButton: opts.showConfirmButton ?? true,
    ...opts.swalOptions,
  });
};

export const info = (title = 'Info', text = '', opts = {}) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    showConfirmButton: opts.showConfirmButton ?? true,
    ...opts.swalOptions,
  });
};

export const toast = (message, icon = 'success', opts = {}) => {
  const Toast = Swal.mixin({
    toast: true,
    position: opts.position || 'top-end',
    showConfirmButton: false,
    timer: opts.timer || 2000,
    timerProgressBar: true,
  });

  return Toast.fire({
    icon,
    title: message,
  });
};

export default {
  confirm,
  success,
  error,
  info,
  toast,
};
