import { parseISO, format, isValid } from 'date-fns';

function formatDate(dateInput: string | Date | undefined | null, dateFormat = 'dd/MM/yyyy'): string {
  if (!dateInput) {
    return 'Data inválida';
  }

  if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
    return dateInput;
  }

  let date: Date;

  if (typeof dateInput === 'string') {
    date = parseISO(dateInput);
    
    if (!isValid(date)) {
      date = new Date(dateInput);
    }
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return 'Data inválida';
  }

  return isValid(date) ? format(date, dateFormat) : 'Data inválida';
}

export default formatDate;
