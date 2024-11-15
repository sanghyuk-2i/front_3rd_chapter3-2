import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard 여기 제공 안함
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1); // 간단한 ID 생성
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),

    http.post('/api/events-list', async ({ request }) => {
      let { events: newEvents } = (await request.json()) as { events: Event[] };

      newEvents.forEach((event) => {
        const repeatId = '1';
        const isRepeatEvent = event.repeat.type !== 'none';

        const newEvent = {
          ...event,
          id: String(mockEvents.length + 1),
          repeat: {
            ...event.repeat,
            id: isRepeatEvent ? repeatId : undefined,
          },
        };

        mockEvents.push(newEvent);
      });

      return HttpResponse.json({ events: mockEvents });
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의2',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
    {
      id: '3',
      title: '기존 회의3',
      date: '2024-10-16',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 3',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'daily', interval: 1, endDate: '2024-10-17' },
      notificationTime: 5,
    },
    {
      id: '4',
      title: '기존 회의4',
      date: '2024-10-17',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 4',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'daily', interval: 1, endDate: '2024-10-17' },
      notificationTime: 5,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    }),

    http.put('/api/events-list', async ({ request }) => {
      const needUpdateEvents = (await request.json()) as Event[];

      const isEventsAllAvaliable = needUpdateEvents.every(({ id }) => {
        const index = mockEvents.findIndex((event) => event.id === id);
        return index !== -1;
      });

      if (!isEventsAllAvaliable) {
        return new HttpResponse(null, { status: 404 });
      }

      needUpdateEvents.forEach((updateEvent) => {
        const { id } = updateEvent;
        const index = mockEvents.findIndex((event) => event.id === id);

        mockEvents[index] = { ...mockEvents[index], ...updateEvent };
      });

      return HttpResponse.json({ events: mockEvents }, { status: 200 });
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '삭제할 이벤트',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제할 이벤트입니다',
      location: '어딘가',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '반복 이벤트',
      date: '2024-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '반복 이벤트입니다',
      location: '어딘가',
      category: '기타',
      repeat: { type: 'daily', interval: 1, endDate: '2024-10-17' },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '삭제할 반복 이벤트',
      date: '2024-10-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제할 반복 이벤트입니다',
      location: '어딘가',
      category: '기타',
      repeat: { type: 'daily', interval: 1, endDate: '2024-10-17' },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
