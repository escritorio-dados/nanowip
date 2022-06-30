import { Edit, SwapVert } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { HeaderList } from '#shared/components/HeaderList';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { IOperationalObjective } from '#modules/objectives/operationalObjectives/types/IOperationalObjective';

import { CreateObjectiveCategoryModal } from '../../components/CreateObjectiveCategory';
import { DeleteObjectiveCategoryModal } from '../../components/DeleteObjectiveCategory';
import { InfoObjectiveCategoryModal } from '../../components/InfoObjectiveCategory';
import { ObjectiveCategoryCard } from '../../components/ObjectiveCategoryCard';
import { SortObjectiveCategory } from '../../components/SortObjectiveCategory';
import { UpdateObjectiveCategoryModal } from '../../components/UpdateObjectiveCategory';
import { IObjectiveCategory } from '../../types/IObjectiveCategory';

type IIdNameModal = { id: string; name: string } | null;
type IIdModal = { id: string } | null;

export function ListObjectiveCategories() {
  const [createCategory, setCreateCategory] = useState(false);
  const [sortCategories, setSortCategories] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<IIdNameModal>(null);
  const [updateCategory, setUpdateCategory] = useState<IIdModal>(null);
  const [infoCategory, setInfoCategory] = useState<IIdModal>(null);

  const params = useParams();
  const { updateTitle } = useTitle();
  const { toast } = useToast();
  const { getBackUrl } = useGoBackUrl();
  const { checkPermissions } = useAuth();

  const {
    loading: operationalObjectiveLoading,
    data: operationalObjectiveData,
    error: operationalObjectiveError,
  } = useGet<IOperationalObjective>({
    url: `/operational_objectives/${params.operational_objective_id}`,
  });

  const {
    loading: categoriesLoading,
    data: categoriesData,
    error: categoriesError,
    send: getCategories,
    updateData: updateCategories,
  } = useGet<IObjectiveCategory[]>({ url: `/objective_categories`, lazy: true });

  useEffect(() => {
    if (params.operational_objective_id) {
      getCategories({
        params: { operational_objective_id: params.operational_objective_id },
      });
    }
  }, [getCategories, params.operational_objective_id]);

  useEffect(() => {
    if (operationalObjectiveError) {
      toast({ message: operationalObjectiveError, severity: 'error' });

      return;
    }

    if (categoriesError) {
      toast({ message: categoriesError, severity: 'error' });
    }
  }, [operationalObjectiveError, categoriesError, toast]);

  useEffect(() => {
    const name = operationalObjectiveData
      ? `${operationalObjectiveData.name} | ${operationalObjectiveData.integratedObjective.name}`
      : '';

    updateTitle(`Categorias - ${name}`);
  }, [operationalObjectiveData, updateTitle]);

  const permissions = useMemo(() => {
    return {
      createObjectiveCategory: checkPermissions([
        [PermissionsUser.create_objective_category, PermissionsUser.manage_objective_category],
      ]),
      updateObjectiveCategory: checkPermissions([
        [PermissionsUser.update_objective_category, PermissionsUser.manage_objective_category],
      ]),
      deleteObjectiveCategory: checkPermissions([
        [PermissionsUser.delete_objective_category, PermissionsUser.manage_objective_category],
      ]),
    };
  }, [checkPermissions]);

  const addList = useCallback(
    (data: IObjectiveCategory) => {
      updateCategories((oldData) => [...oldData, data]);
    },
    [updateCategories],
  );

  const deleteList = useCallback(
    (id: string) => {
      updateCategories((oldData) => oldData.filter((old) => old.id !== id));
    },
    [updateCategories],
  );

  const updateList = useCallback(
    (id: string, data: IObjectiveCategory) => {
      if (data.operationalObjective) {
        updateCategories((oldData) => oldData.filter((old) => old.id !== id));
      } else {
        updateCategories((oldData) => oldData.map((old) => (id === old.id ? data : old)));
      }
    },
    [updateCategories],
  );

  if (operationalObjectiveLoading) return <Loading loading={operationalObjectiveLoading} />;

  return (
    <>
      <Loading loading={categoriesLoading} />

      {createCategory && (
        <CreateObjectiveCategoryModal
          openModal={createCategory}
          closeModal={() => setCreateCategory(false)}
          operational_objective_id={operationalObjectiveData.id}
          addList={addList}
        />
      )}

      {sortCategories && (
        <SortObjectiveCategory
          openModal={sortCategories}
          closeModal={() => setSortCategories(false)}
          operational_objective_id={operationalObjectiveData.id}
          reloadList={() =>
            getCategories({
              params: { operational_objective_id: operationalObjectiveData.id },
            })
          }
        />
      )}

      {!!deleteCategory && (
        <DeleteObjectiveCategoryModal
          openModal={!!deleteCategory}
          closeModal={() => setDeleteCategory(null)}
          objectiveCategory={deleteCategory}
          updateList={deleteList}
        />
      )}

      {!!infoCategory && (
        <InfoObjectiveCategoryModal
          openModal={!!infoCategory}
          closeModal={() => setInfoCategory(null)}
          objective_category_id={infoCategory.id}
        />
      )}

      {!!updateCategory && (
        <UpdateObjectiveCategoryModal
          openModal={!!updateCategory}
          closeModal={() => setUpdateCategory(null)}
          objective_category_id={updateCategory.id}
          updateList={updateList}
        />
      )}

      <HeaderList
        id="objectiveCategories"
        goBackUrl={getBackUrl('objective_categories')}
        custom_actions={
          <>
            {permissions.updateObjectiveCategory && (
              <CustomIconButton
                iconType="custom"
                title="Mudar Ordem das Categoria"
                action={() => setSortCategories(true)}
                CustomIcon={<SwapVert fontSize="medium" sx={{ color: 'text.primary' }} />}
              />
            )}

            {permissions.createObjectiveCategory && (
              <CustomIconButton
                action={() => setCreateCategory(true)}
                title="Cadastrar Categoria"
                iconType="add"
              />
            )}
          </>
        }
      >
        <>
          {categoriesData &&
            categoriesData.map((category) => (
              <ObjectiveCategoryCard
                key={category.id}
                category={category}
                customActions={
                  <>
                    <CustomIconButton
                      iconType="info"
                      iconSize="small"
                      title="Informações"
                      action={() => setInfoCategory({ id: category.id })}
                    />

                    {permissions.updateObjectiveCategory && (
                      <CustomIconButton
                        iconType="custom"
                        title="Editar Categoria"
                        action={() => setUpdateCategory({ id: category.id })}
                        CustomIcon={<Edit fontSize="small" sx={{ color: 'text.primary' }} />}
                      />
                    )}

                    {permissions.deleteObjectiveCategory && (
                      <CustomIconButton
                        iconType="delete"
                        iconSize="small"
                        title="Deletar Categoria"
                        action={() => setDeleteCategory({ id: category.id, name: category.name })}
                      />
                    )}
                  </>
                }
              />
            ))}
        </>
      </HeaderList>
    </>
  );
}
