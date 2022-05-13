import { Injectable } from '@nestjs/common';

import { recalculateEndDate, recalculateStartDate } from '@shared/utils/changeDatesAux';
import { sliceList } from '@shared/utils/sliceList';

import { StatusAssignment } from '@modules/assignments/enums/status.assignment.enum';
import { TasksRepository } from '@modules/tasks/repositories/tasks.repository';

@Injectable()
export class RecalculateDatesTaskService {
  constructor(private tasksRepository: TasksRepository) {}

  async recalculateDates(organization_id: string) {
    // Pegar todos os tasks junto com os seus assignments
    const tasks = await this.tasksRepository.findAll({
      relations: ['assignments'],
      organization_id,
    });

    // Separando as tarefas em pacotes menores (Para conseguir salvar) (2000 Registros por pacote)
    const splicedTasks = sliceList({ array: tasks, maxLenght: 2000 });

    for await (const sliceTasks of splicedTasks) {
      const tasksRecalculated = sliceTasks.map(task => {
        const validAssignments = task.assignments.filter(
          ({ status }) => status === StatusAssignment.close,
        );

        // Recalcula a data de inicio com todas as atribuições
        const startCalculated = recalculateStartDate(task.assignments);

        // Recalcula a data de término somente com as atribuições fechadas
        const endCalculated = recalculateEndDate(validAssignments);

        return {
          ...task,
          startDate: startCalculated,
          endDate: endCalculated,
        };
      });

      await this.tasksRepository.saveAll(tasksRecalculated);
    }
  }
}
