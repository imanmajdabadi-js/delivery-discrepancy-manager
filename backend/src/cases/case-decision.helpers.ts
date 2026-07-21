import { DecisionType } from '../generated/prisma/client';

export interface CaseDecisionInput {
  type: DecisionType;
  explanation: string;
}

export interface CaseDecisionValidationIssue {
  field: string;
  code: string;
  message: string;
}

interface ParseResult {
  value: CaseDecisionInput | null;
  issues: CaseDecisionValidationIssue[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDecisionType(value: unknown): value is DecisionType {
  return value === DecisionType.APPROVE || value === DecisionType.REJECT;
}

export function parseCaseDecisionInput(input: unknown): ParseResult {
  if (!isRecord(input)) {
    return {
      value: null,
      issues: [
        {
          field: 'body',
          code: 'INVALID_BODY',
          message: 'اطلاعات تصمیم ساختار معتبری ندارد.',
        },
      ],
    };
  }

  const issues: CaseDecisionValidationIssue[] = [];
  const type = input.type;
  const explanation =
    typeof input.explanation === 'string' ? input.explanation.trim() : '';

  if (!isDecisionType(type)) {
    issues.push({
      field: 'type',
      code: 'INVALID_DECISION_TYPE',
      message: 'نوع تصمیم معتبر نیست.',
    });
  }

  if (!explanation) {
    issues.push({
      field: 'explanation',
      code: 'EXPLANATION_REQUIRED',
      message: 'توضیح تصمیم را وارد کنید.',
    });
  }

  if (issues.length > 0 || !isDecisionType(type)) {
    return { value: null, issues };
  }

  return {
    value: { type, explanation },
    issues: [],
  };
}
