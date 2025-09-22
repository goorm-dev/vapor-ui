import { useCallback, useState } from 'react';

interface UseClipboardOptions {
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
}

const useClipboard = (options?: UseClipboardOptions) => {
  const [copied, setCopied] = useState(false);
  const { onSuccess, onError } = options || {};

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      onSuccess?.(text);
      return true;
    } catch (error) {
      const clipboardError = error instanceof Error ? error : new Error('Failed to copy to clipboard');
      setCopied(false);
      onError?.(clipboardError);
      return false;
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  return { copyToClipboard, copied, reset };
};

export { useClipboard };
export type { UseClipboardOptions };