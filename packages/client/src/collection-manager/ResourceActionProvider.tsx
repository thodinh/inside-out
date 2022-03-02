import { Result } from 'ahooks/lib/useRequest/src/types';
import React, { createContext, useContext, useEffect } from 'react';
import { useCollectionManager } from '.';
import { CollectionProvider, useRecord } from '..';
import { useAPIClient, useRequest } from '../api-client';

export const ResourceActionContext = createContext<Result<any, any> & { state?: any; setState?: any }>(null);

interface ResourceActionProviderProps {
  type?: 'association' | 'collection';
  request?: any;
  uid?: string;
}

const ResourceContext = createContext<any>(null);

const InternalCollectionResourceActionProvider = (props) => {
  let { collection, request, uid } = props;
  const api = useAPIClient();
  const service = useRequest(
    {
      ...request,
      params: {
        ...request?.params,
        appends: collection.fields.filter(field => field.target).map((field) => field.name),
      },
    },
    { uid },
  );
  const resource = api.resource(request.resource);
  return (
    <ResourceContext.Provider value={{ type: 'collection', resource, collection }}>
      <ResourceActionContext.Provider value={service}>
        <CollectionProvider collection={collection}>{props.children}</CollectionProvider>
      </ResourceActionContext.Provider>
    </ResourceContext.Provider>
  );
};

const CollectionResourceActionProvider = (props) => {
  let { collection, request, uid } = props;
  const { getCollection } = useCollectionManager();
  if (typeof collection === 'string') {
    collection = getCollection(collection);
  }
  if (!collection) {
    return null;
  }
  return <InternalCollectionResourceActionProvider {...props} collection={collection} />;
};

const AssociationResourceActionProvider = (props) => {
  let { collection, association, request, uid } = props;
  const { get } = useCollectionManager();
  const api = useAPIClient();
  const record = useRecord();
  const resourceOf = record[association.sourceKey];
  const service = useRequest({ resourceOf, ...request }, { uid });
  const resource = api.resource(request.resource, resourceOf);
  if (typeof collection === 'string') {
    collection = get(collection);
  }
  if (!collection) {
    return null;
  }
  return (
    <ResourceContext.Provider value={{ type: 'association', resource, association }}>
      <ResourceActionContext.Provider value={service}>
        <CollectionProvider collection={collection}>{props.children}</CollectionProvider>
      </ResourceActionContext.Provider>
    </ResourceContext.Provider>
  );
};

export const ResourceActionProvider: React.FC<ResourceActionProviderProps> = (props) => {
  const { request } = props;
  if (request?.resource?.includes('.')) {
    return <AssociationResourceActionProvider {...props} />;
  }
  return <CollectionResourceActionProvider {...props} />;
};

export const useResourceActionContext = () => {
  return useContext(ResourceActionContext);
};

export const useDataSourceFromRAC = (options: any) => {
  const service = useContext(ResourceActionContext);
  useEffect(() => {
    if (!service.loading) {
      options?.onSuccess(service.data);
    }
  }, [service.loading]);
  return service;
};

export const useResourceContext = () => {
  const { type, resource, collection, association } = useContext(ResourceContext);
  return {
    type,
    resource,
    collection,
    association,
    targetKey: association?.targetKey || collection?.targetKey || 'id',
  };
};
