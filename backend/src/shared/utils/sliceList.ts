type ISliceListParams<T> = { array: Array<T>; maxLenght: number };

export function sliceList<T>({ array, maxLenght }: ISliceListParams<T>): Array<T[]> {
  // Impede bugs
  if (maxLenght <= 0) {
    return [array];
  }

  // Pega o numeros de cortes que vão ser feitos no array para ele não passar do limite maximo
  const slicesNumber = Math.ceil(array.length / maxLenght);

  // Array que vai armazenar cada um dos cortes
  const arrayParts: Array<T[]> = [];

  // Fazendo a divisão de cada corte do array e armazenado no array acima, tendo cada corte o valor de elementos solicitados
  for (let i = 0; i < slicesNumber; i += 1) {
    const start = 0 + i * maxLenght;

    const end = maxLenght + i * maxLenght;

    const arrayPart = array.slice(start, end);

    arrayParts.push(arrayPart);
  }

  return arrayParts;
}
