import ApiServices from '.';
import {
  CreateEventMutation,
  AwardsBody,
  ListEventsQueryVariables,
  CreateEventMutationVariables,
  UpdateEventMutation,
  UpdateEventMutationVariables,
  EventStatus,
  UpdateEventInput,
  CategoryName,
  GetEventQuery,
  GetEventQueryVariables,
} from '../../API';
import { getAwardsBodyCategories, iCategoryData } from '../../constants/categories';
import * as mutations from '../../graphql/mutations';
import * as customQueries from '../../graphqlCustom/queries';
import { ListEventsQuery } from '../../graphqlCustom/types';
import { GraphqlAPI, handleError, iApiResponse } from '../utils';

export const getAllEvents = async (): Promise<iApiResponse<ListEventsQuery>> => {
  try {
    const { data, errors } = await GraphqlAPI<ListEventsQuery, ListEventsQueryVariables>(
      customQueries.listEvents,
    );
    if (!data?.listEvents) {
      throw new Error(JSON.stringify(errors));
    }
    return { status: 'success', data };
  } catch (err) {
    return handleError('error getting all events', err);
  }
};

export const getEvent = async (id: string): Promise<iApiResponse<GetEventQuery>> => {
  try {
    const { data, errors } = await GraphqlAPI<GetEventQuery, GetEventQueryVariables>(
      customQueries.getEvent,
      { id },
    );
    if (!data?.getEvent) {
      throw new Error(JSON.stringify(errors));
    }
    return { status: 'success', data };
  } catch (err) {
    return handleError('error getting all events', err);
  }
};

export const getUniqueEvents = async (
  awardsBody: AwardsBody,
  year: number,
): Promise<iApiResponse<ListEventsQuery>> => {
  try {
    // enforce uniqueness - don't allow duplicate events to be created
    const { data, errors } = await GraphqlAPI<ListEventsQuery, ListEventsQueryVariables>(
      customQueries.listEvents,
      {
        filter: {
          awardsBody: { eq: awardsBody },
          year: { eq: year },
        },
      },
    );
    if (!data?.listEvents) {
      throw new Error(JSON.stringify(errors));
    }
    return { status: 'success', data };
  } catch (err) {
    return handleError('error getting events', err);
  }
};

// Creates events AND categories on event
// TODO: Make atomic, so that if one category fails to create, the whole event is not created
export const createEvent = async (
  awardsBody: AwardsBody,
  year: number,
): Promise<iApiResponse<CreateEventMutation>> => {
  try {
    // enforce uniqueness - don't allow duplicate events to be created
    const { data: d } = await getUniqueEvents(awardsBody, year);
    if (!d) return { status: 'error' };
    if (d.listEvents?.items.length !== 0) {
      return { status: 'error', message: 'This event has already been created' };
    }
    // Create event
    const { data, errors } = await GraphqlAPI<
      CreateEventMutation,
      CreateEventMutationVariables
    >(mutations.createEvent, {
      input: {
        awardsBody,
        year,
      },
    });
    if (!data?.createEvent) {
      throw new Error(JSON.stringify(errors));
    }
    const eventId = data.createEvent.id;
    // create categories on event
    const category = getAwardsBodyCategories(awardsBody, year);
    const categoryList = Object.entries(category) as [
      CategoryName,
      iCategoryData | undefined,
    ][];
    categoryList.forEach(async ([catName, catData]) => {
      if (catData) {
        await ApiServices.createCategory(catName, catData.type, eventId);
      }
    });
    return { status: 'success', data };
  } catch (err) {
    return handleError('error creating event', err);
  }
};

export const updateEvent = async (
  eventId: string,
  params: {
    awardsBody?: AwardsBody;
    year?: number;
    status?: EventStatus;
    nominationDateTime?: string | null;
    winDateTime?: string | null;
  },
): Promise<iApiResponse<UpdateEventMutation>> => {
  const { awardsBody, year, status, nominationDateTime, winDateTime } = params;
  // create input object with only the fields that are being updated
  const input: UpdateEventInput = { id: eventId };
  if (awardsBody) input.awardsBody = awardsBody;
  if (year) input.year = year;
  if (status) {
    input.status = status;
    if (input.status === EventStatus.NOMS_LIVE) {
      // WARN: This means that if you ever switch to another status, then back, it's going to reset the liveAt value, which resets the minimum history date, which makes it seem like history is missing. Could just manually edit in the backend
      input.liveAt = new Date().toISOString();
    }
    // TODO: add logic for when winners go live, but not sure how handling this yet so TBD
    if (input.status === EventStatus.WINS_LIVE) {
      //   input.winsLive = new Date().toISOString();
    }
  }
  if (nominationDateTime !== undefined) input.nominationDateTime = nominationDateTime;
  if (winDateTime !== undefined) input.winDateTime = winDateTime;
  try {
    // Update event
    const { data, errors } = await GraphqlAPI<
      UpdateEventMutation,
      UpdateEventMutationVariables
    >(mutations.updateEvent, { input });
    if (!data?.updateEvent) {
      throw new Error(JSON.stringify(errors));
    }
    return { status: 'success' };
  } catch (err) {
    return handleError('error creating event', err);
  }
};
