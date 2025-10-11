import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/config";
import { getCertificateTemplateByIdThunk } from "store/certificateTemplate/certificateTemplateThunks";
import type { CertificateTemplateResult } from "common/@types/certificateTemplate";

interface UseCertificateTemplateReturn {
  template: CertificateTemplateResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch certificate template by ID
 * Includes caching to avoid redundant API calls
 */
export function useCertificateTemplate(
  templateId: string
): UseCertificateTemplateReturn {
  const dispatch = useAppDispatch();
  const [template, setTemplate] = useState<CertificateTemplateResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if template is already in Redux store
  const cachedTemplate = useAppSelector((state) => {
    const templates = state.certificateTemplate.templates.data?.items || [];
    return templates.find((t) => t.id === templateId) || null;
  });

  useEffect(() => {
    // If template is already cached, use it
    if (cachedTemplate) {
      setTemplate(cachedTemplate);
      return;
    }

    // Skip if no templateId
    if (!templateId) {
      return;
    }

    // Fetch template from API
    const fetchTemplate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await dispatch(
          getCertificateTemplateByIdThunk(templateId)
        ).unwrap();
        setTemplate(result);
      } catch (err: any) {
        setError(
          typeof err === "string"
            ? err
            : err?.message || "Failed to fetch certificate template"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, cachedTemplate, dispatch]);

  return { template, isLoading, error };
}
