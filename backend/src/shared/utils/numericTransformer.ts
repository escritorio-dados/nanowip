export class NumericTransformer {
  to(data?: number | null) {
    return data;
  }

  from(data?: string | null) {
    if (!data) {
      return null;
    }

    const parsed = parseFloat(data);

    if (Number.isNaN(parsed)) {
      return null;
    }

    return parsed;
  }
}
