import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Button, Modal, Input, message, Table, Select, Badge, Tag } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CalendarOutlined,
  ClockCircleOutlined,
  BellOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

const UpcomingEvents = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isUpdateEventModalOpen, setIsUpdateEventModalOpen] = useState(false);
  const [events, setEvents] = useState({ Meeting: [], Deadline: [], Others: [] });
  const [newEvent, setNewEvent] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notificationTime, setNotificationTime] = useState(1440);
  const [eventType, setEventType] = useState('Meeting');
  const [openDropdown, setOpenDropdown] = useState(null);

  const showBaseModal = () => setIsBaseModalOpen(true);
  const handleBaseCancel = () => setIsBaseModalOpen(false);

  const showCreateEventModal = () => {
    setIsCreateEventModalOpen(true);
    handleBaseCancel();
  };
  const handleCreateCancel = () => setIsCreateEventModalOpen(false);

  const showUpdateEventModal = () => {
    setIsUpdateEventModalOpen(true);
    handleBaseCancel();
  };
  const handleUpdateCancel = () => setIsUpdateEventModalOpen(false);

  const getAuthHeaders = () => {
    const accessToken = Cookies.get('accessToken');
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  };

  const handleDeleteEvent = async (eventdataId) => {
    console.log(eventdataId, eventType);
    if (!eventdataId || !eventType) {
      message.error('No event selected or event type is undefined.');
      return;
    }

    const updatedEvents = { ...events };
    updatedEvents[eventType] = updatedEvents[eventType].filter(
      (event) => event.id !== eventdataId
    );
    setEvents(updatedEvents);

    try {
      const deleteEventData = { id: eventdataId, type: eventType };
      await axios.delete(
        `http://127.0.0.1:8000/api/client/events/delete_event/`,
        {
          headers: getAuthHeaders(),
          data: deleteEventData,
        }
      );
      message.success('Event deleted successfully!');
      handleBaseCancel();
    } catch (error) {
      message.error('Failed to delete event. Please try again later.');
      console.error('Delete event error:', error);
      setEvents(events);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/client/events/', {
        headers: getAuthHeaders(),
      });
      const groupedEvents = { Meeting: [], Deadline: [], Others: [] };
      response.data.forEach((event) => {
        if (event.type === 'Meeting') {
          groupedEvents.Meeting.push(event);
        } else if (event.type === 'Deadline') {
          groupedEvents.Deadline.push(event);
        } else {
          groupedEvents.Others.push(event);
        }
      });
      setEvents(groupedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents({ Meeting: [], Deadline: [], Others: [] });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async () => {
    if (newEvent.trim()) {
      const newEventData = {
        title: newEvent,
        start: selectedDate.dataset.date,
        notification_time: notificationTime,
        type: eventType,
      };

      const updatedEvents = { ...events };
      updatedEvents[eventType] = [...updatedEvents[eventType], { ...newEventData, id: Date.now() }];
      setEvents(updatedEvents);

      try {
        await axios.post(
          'http://127.0.0.1:8000/api/client/events/create_event/',
          newEventData,
          { headers: getAuthHeaders() }
        );
        message.success('Event created successfully!');
        fetchEvents();
        handleCreateCancel();
      } catch (error) {
        message.error('Error creating event');
        console.error('Create event error:', error);
        setEvents(events);
      }
    } else {
      message.error('Please enter an event title!');
    }
  };

  const handleUpdateEvent = async (selectedEvent,eventType) => {
    if (newEvent.trim() && selectedEvent) {
        const updatedEventData = { 
            id: selectedEvent.id, 
            title: newEvent, 
            notification_time: notificationTime,
            type: eventType || selectedEvent.type
        };

        const updatedEvents = { ...events };

        if (updatedEvents[eventType]) {
            updatedEvents[eventType] = updatedEvents[eventType].map((event) =>
                event.id === selectedEvent.id ? { ...event, title: newEvent, type: eventType } : event
            );
            setEvents(updatedEvents);
        } else {
            message.error('Event type not found in the events list.');
            return;
        }

        console.log('Updating event with data:', updatedEventData);

        try {
            await axios.put(
                `http://127.0.0.1:8000/api/client/events/update_event/`,
                updatedEventData,
                { headers: getAuthHeaders() }
            );
            message.success('Event updated successfully!');
            fetchEvents();
            handleUpdateCancel();
        } catch (error) {
            message.error('Failed to update event. Please try again later.');
            console.error('Update event error:', error);
            setEvents(events);
        }
    } else {
        message.error('Please enter an event title!');
    }
};

  const eventTypes = [
    { 
      value: 'Meeting', 
      icon: <TeamOutlined />, 
      color: 'bg-freelancer-accent',
      gradient: 'from-freelancer-accent to-freelancer-accent/80'
    },
    { 
      value: 'Deadline', 
      icon: <ClockCircleOutlined />, 
      color: 'bg-status-error',
      gradient: 'from-status-error to-status-error/80'
    },
    { 
      value: 'Others', 
      icon: <FileTextOutlined />, 
      color: 'bg-freelancer-secondary',
      gradient: 'from-freelancer-secondary to-freelancer-secondary/80'
    }
  ];

  const getEventTypeColor = (type) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.color || 'bg-text-secondary';
  };

  const eventColumns = [
    {
      title: 'Event Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <div className="flex items-center space-x-2">
          {eventTypes.find(t => t.value === type)?.icon}
          <span className={`px-2 py-1 rounded text-xs text-white ${getEventTypeColor(type)}`}>
            {type}
          </span>
        </div>
      ),
    },
    {
      title: 'Event Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date',
      dataIndex: 'start',
      key: 'start',
      render: (text, event) => (
        <span>{event.start ? formatDate(event.start) : 'N/A'}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, event) => (
        <div className="space-x-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedEvent(event);
              setNewEvent(event.title);
              setNotificationTime(event.notification_time || 1440);
              setEventType(event.type);
              showUpdateEventModal();
            }}
            className="border-freelancer-border-DEFAULT"
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              setSelectedEvent(event);
              handleDeleteEvent(event.id);
            }}
          />
        </div>
      ),
    },
  ];

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventType(event.extendedProps.type);
    showBaseModal();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const handleDateClick = (e) => {
    const clickedDate = new Date(e.dateStr);
    if (isPastDate(clickedDate)) {
      message.warning("Cannot create events for past dates");
      return;
    }
    
    setNewEvent('');
    setSelectedEvent(null);
    setSelectedDate(e.dayEl);
    showCreateEventModal();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  // Minimal motion variants
  const motionVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.2
        }
      }
    }
  };

  return (
    <div className="p-6 bg-freelancer-bg-DEFAULT min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold text-freelancer-text-primary mb-2">Upcoming Events</h2>
        <p className="text-freelancer-text-secondary">Manage your schedule and important deadlines</p>
      </motion.div>

      {/* Calendar Container */}
      <div className="calendar-container bg-freelancer-primary rounded-md border border-freelancer-border-DEFAULT overflow-hidden mb-8">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={events.Meeting.concat(events.Deadline, events.Others)}
          height="auto"
          headerToolbar={{
            start: 'prev,next today',
            center: 'title',
            end: 'timeGridWeek,dayGridMonth'
          }}
          eventClick={(info) => handleEventClick(info.event)}
          dateClick={handleDateClick}
          dayCellClassNames={(arg) => {
            return isPastDate(arg.date) ? 'past-date' : '';
          }}
          validRange={{
            start: new Date()
          }}
          eventContent={(eventInfo) => ({
            html: `
              <div class="event-content ${getEventTypeColor(eventInfo.event.extendedProps.type)}">
                <span class="event-title">${eventInfo.event.title}</span>
              </div>
            `
          })}
        />
      </div>

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-freelancer-text-primary flex items-center gap-2 mb-4 sm:mb-0">
            <FileTextOutlined className="text-freelancer-accent" /> Event List
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          {eventTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setEventType(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded border transition-colors
                ${eventType === type.value 
                  ? `${type.color} text-white border-transparent` 
                  : 'bg-freelancer-bg-card text-freelancer-text-secondary border-white/10 hover:border-freelancer-accent/30'}`}
            >
              {type.icon}
              <span>{type.value}</span>
              <Badge 
                count={events[type.value]?.length || 0}
                showZero
                className="flex items-center justify-center"
                style={{ 
                  backgroundColor: eventType === type.value ? 'rgba(255,255,255,0.3)' : 'var(--freelancer-accent)',
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '10px',
                  padding: '0 6px',
                  fontSize: '12px',
                  lineHeight: '20px'
                }}
              />
            </button>
          ))}
        </div>

        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          <AnimatePresence>
            {(events[eventType] || []).map((event, index) => (
              <motion.div
                key={event.id}
                variants={motionVariants.item}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-freelancer-bg-card rounded border border-white/10 overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-freelancer-text-primary">{event.title}</h3>
                    <Tag className={`${getEventTypeColor(event.type)} text-white border-none`}>
                      {event.type}
                    </Tag>
                  </div>
                </div>

                <AnimatePresence>
                  {openDropdown === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="border-t border-white/10 overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        <div className="flex items-center gap-2 text-freelancer-text-secondary">
                          <CalendarOutlined />
                          <span>{event.start ? formatDate(event.start) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                              setSelectedEvent(event);
                              setNewEvent(event.title);
                              setNotificationTime(event.notification_time || 1440);
                              setEventType(event.type);
                              showUpdateEventModal();
                            }}
                            className="text-freelancer-text-primary"
                          />
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                              setSelectedEvent(event);
                              handleDeleteEvent(event.id);
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-freelancer-primary rounded border border-ui-border overflow-hidden">
          <Table
            dataSource={events[eventType] || []}
            columns={eventColumns}
            rowKey="id"
            pagination={false}
            className="custom-table"
            scroll={{ x: true }}
          />
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-freelancer-primary">
            {selectedEvent ? <EditOutlined /> : <PlusOutlined />}
            <span>{selectedEvent ? 'Update Event' : 'Create Event'}</span>
          </div>
        }
        open={isCreateEventModalOpen || isUpdateEventModalOpen}
        onCancel={() => {
          handleCreateCancel();
          handleUpdateCancel();
        }}
        footer={null}
        className="custom-modal"
        width={window.innerWidth < 768 ? '90%' : '50%'}
      >
        <div className="space-y-4 p-4">
          {/* Event Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {eventTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setEventType(type.value)}
                className={`flex flex-col items-center p-3 rounded border-2 transition-colors
                  ${eventType === type.value 
                    ? `border-freelancer-primary ${type.color} text-white` 
                    : 'border-ui-border text-text-secondary'}`}
              >
                {type.icon}
                <span className="text-sm mt-1">{type.value}</span>
              </button>
            ))}
          </div>

          {/* Event Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-freelancer-text-primary">Event Title</label>
            <Input
              prefix={<FileTextOutlined className="text-text-muted" />}
              placeholder="Enter event title"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              className="rounded border-ui-border focus:border-freelancer-primary bg-freelancer-primary text-text-muted"
            />
          </div>

          {/* Notification Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Notification Time</label>
            <Select
              value={notificationTime}
              onChange={(value) => setNotificationTime(value)}
              className="w-full"
              suffixIcon={<BellOutlined className="text-text-secondary" />}
            >
              <Select.Option value={60}>1 Hour Before</Select.Option>
              <Select.Option value={180}>3 Hours Before</Select.Option>
              <Select.Option value={360}>6 Hours Before</Select.Option>
              <Select.Option value={1440}>1 Day Before</Select.Option>
              <Select.Option value={4320}>3 Days Before</Select.Option>
              <Select.Option value={10080}>1 Week Before</Select.Option>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => {
              handleCreateCancel();
              handleUpdateCancel();
            }}>
              Cancel
            </Button>
            <Button
              type="primary"
              icon={selectedEvent ? <CheckCircleOutlined /> : <PlusOutlined />}
              onClick={()=>selectedEvent ? handleUpdateEvent(selectedEvent,eventType) : handleCreateEvent()}
              style={{ backgroundColor: '#2B6CB0', borderColor: '#2B6CB0' }}
            >
              {selectedEvent ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal for Update/Delete Options */}
      <Modal
        title="Event Options"
        open={isBaseModalOpen}
        onCancel={handleBaseCancel}
        footer={null}
        className="custom-modal"
        width={window.innerWidth < 768 ? '90%' : '50%'}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-text-primary">Selected Event: {selectedEvent?.title}</h3>
          <div className="mt-4 space-y-2">
            <p className="text-text-secondary"><span className="font-medium text-text-primary">Event Type:</span> {eventType}</p>
            <p className="text-text-secondary"><span className="font-medium text-text-primary">Date:</span> {selectedEvent?.start ? formatDate(selectedEvent.start) : 'N/A'}</p>
            <p className="text-text-secondary"><span className="font-medium text-text-primary">Notification Time:</span> {selectedEvent?.notification_time}</p>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setNewEvent(selectedEvent?.title);
                setNotificationTime(selectedEvent?.notification_time || 1440);
                setEventType(selectedEvent?.type);
                showUpdateEventModal();
                handleBaseCancel();
              }}
              style={{ backgroundColor: '#2B6CB0', borderColor: '#2B6CB0' }}
            >
              Update
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                if (selectedEvent?.id && eventType) {
                  handleDeleteEvent(selectedEvent.id);
                  handleBaseCancel();
                } else {
                  message.error('Event type or ID is missing!');
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Minimal Calendar Styles */}
      <style>{`
        .calendar-container {
          transition: all 0.3s ease;
          background: var(--freelancer-bg-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .calendar-container .fc-toolbar {
          padding: 24px;
          background: var(--freelancer-bg-card);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .calendar-container .fc-toolbar-title {
          color: var(--text-secondary) !important;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .calendar-container .fc-button-primary {
          background: var(--freelancer-bg-card) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-secondary) !important;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .calendar-container .fc-button-primary:hover {
          background: var(--freelancer-accent) !important;
          border-color: var(--freelancer-accent) !important;
          color: white !important;
        }

        .calendar-container .fc-button-primary:not(:disabled):active,
        .calendar-container .fc-button-primary:not(:disabled).fc-button-active {
          background: var(--freelancer-accent) !important;
          border-color: var(--freelancer-accent) !important;
          color: white !important;
        }

        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .calendar-container .fc-day-today {
          background: rgba(var(--freelancer-accent-rgb), 0.1) !important;
        }

        .calendar-container .fc-day-today .fc-daygrid-day-number {
          background: var(--freelancer-accent);
          border-radius: 8px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
        }

        .event-content {
          margin: 1px;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: linear-gradient(to right, var(--freelancer-accent), var(--freelancer-accent)/80);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .event-title {
          color: white;
          font-weight: 500;
        }

        .calendar-container .fc-col-header-cell {
          padding: 12px 0;
          background: var(--freelancer-bg-card);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .calendar-container .fc-col-header-cell-cushion {
          color: var(--text-muted) !important;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .calendar-container .fc-daygrid-day-number {
          color: var(--text-muted) !important;
          font-size: 0.875rem;
          padding: 8px;
        }

        .calendar-container .past-date {
          background-color: rgba(255, 255, 255, 0.05) !important;
          cursor: not-allowed !important;
        }

        .calendar-container .past-date .fc-daygrid-day-number {
          color: var(--text-muted) !important;
          opacity: 0.5;
        }

        .calendar-container .fc-day-future {
          cursor: pointer;
        }

        .calendar-container .fc-day-future.fc-day-today {
          background-color: rgba(var(--freelancer-accent-rgb), 0.1) !important;
        }

        .calendar-container .past-date .event-content {
          opacity: 0.7;
          cursor: default;
        }

        /* Premium Modal Styles */
        .custom-modal .ant-modal-content {
          background: var(--freelancer-bg-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .custom-modal .ant-modal-header {
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 20px 24px;
        }

        .custom-modal .ant-modal-title {
          color: var(--freelancer-text-primary);
          font-weight: 600;
        }

        .custom-modal .ant-modal-body {
          padding: 24px;
        }

        /* Premium Table Styles */
        .custom-table .ant-table {
          background: var(--freelancer-bg-card);
          border-radius: 8px;
        }

        .custom-table .ant-table-thead > tr > th {
          background: var(--freelancer-bg-card);
          color: var(--freelancer-text-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--freelancer-text-primary);
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Premium Button Styles */
        .ant-btn-primary {
          background: var(--freelancer-accent) !important;
          border-color: var(--freelancer-accent) !important;
        }

        .ant-btn-primary:hover {
          background: var(--freelancer-accent)/90 !important;
          border-color: var(--freelancer-accent)/90 !important;
        }

        /* Event Title Input Styles */
        .ant-input {
          background: var(--freelancer-primary) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: var(--text-muted) !important;
        }

        .ant-input::placeholder {
          color: var(--text-muted) !important;
          background: transparent !important;
        }

        .ant-input-prefix {
          color: var(--text-muted) !important;
        }

        .ant-input:hover,
        .ant-input:focus {
          border-color: var(--freelancer-accent) !important;
          box-shadow: 0 0 0 2px rgba(var(--freelancer-accent-rgb), 0.2) !important;
        }

        /* Premium Select Styles */
        .ant-select-selector {
          background: var(--freelancer-bg-card) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .ant-select-selection-item {
          color: var(--freelancer-text-primary) !important;
        }

        .ant-select-arrow {
          color: var(--freelancer-text-secondary) !important;
        }

        .ant-select-dropdown {
          background: var(--freelancer-bg-card) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-select-item {
          color: var(--freelancer-text-primary) !important;
        }

        .ant-select-item-option-selected {
          background: rgba(var(--freelancer-accent-rgb), 0.1) !important;
          color: var(--freelancer-accent) !important;
        }

        .ant-select-item-option-active {
          background: rgba(var(--freelancer-accent-rgb), 0.05) !important;
        }

        /* Calendar Text Colors */
        .calendar-container .fc-toolbar-title {
          color: var(--text-secondary) !important;
        }

        .calendar-container .fc-col-header-cell-cushion {
          color: var(--text-muted) !important;
        }

        .calendar-container .fc-daygrid-day-number {
          color: var(--text-muted) !important;
        }

        .calendar-container .fc-day-today .fc-daygrid-day-number {
          background: var(--freelancer-accent);
          border-radius: 8px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white !important;
          font-weight: 500;
        }

        .calendar-container .fc-col-header-cell-cushion {
          color: var(--text-muted) !important;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .calendar-container .past-date .fc-daygrid-day-number {
          color: var(--text-muted) !important;
          opacity: 0.5;
        }

        /* Modal Styles */
        .custom-modal .ant-modal-content {
          background: var(--freelancer-bg-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .custom-modal .ant-modal-header {
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .custom-modal .ant-modal-title {
          color: var(--freelancer-text-primary);
        }

        .custom-modal .ant-modal-body {
          padding: 24px;
        }

        /* Form Elements */
        .ant-input {
          background: var(--freelancer-primary) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: var(--text-muted) !important;
        }

        .ant-input::placeholder {
          color: var(--text-muted) !important;
        }

        .ant-input-prefix {
          color: var(--text-muted) !important;
        }

        .ant-select-selector {
          background: var(--freelancer-bg-card) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: var(--freelancer-text-primary) !important;
        }

        .ant-select-selection-placeholder {
          color: var(--freelancer-text-secondary) !important;
        }

        .ant-select-selection-item {
          color: var(--freelancer-text-primary) !important;
        }

        .ant-select-arrow {
          color: var(--freelancer-text-secondary) !important;
        }

        /* Labels and Text */
        .ant-form-item-label > label {
          color: var(--freelancer-text-primary) !important;
        }

        .text-text-primary {
          color: var(--freelancer-text-primary) !important;
        }

        .text-text-secondary {
          color: var(--freelancer-text-secondary) !important;
        }

        /* Table Styles */
        .custom-table .ant-table {
          background: var(--freelancer-bg-card);
        }

        .custom-table .ant-table-thead > tr > th {
          background: var(--freelancer-bg-card);
          color: var(--freelancer-text-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .custom-table .ant-table-tbody > tr > td {
          color: var(--freelancer-text-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Event Type Selection in Modal */
        .event-type-button {
          background: var(--freelancer-bg-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--freelancer-text-primary);
        }

        .event-type-button:hover {
          border-color: var(--freelancer-accent);
        }

        .event-type-button.selected {
          background: var(--freelancer-accent);
          border-color: var(--freelancer-accent);
          color: white;
        }

        /* Calendar Event Colors */
        .event-content {
          background: linear-gradient(to right, var(--freelancer-accent), rgba(var(--freelancer-accent-rgb), 0.8));
          color: white;
        }

        .event-content.Deadline {
          background: linear-gradient(to right, var(--status-error), rgba(var(--status-error-rgb), 0.8));
        }

        .event-content.Others {
          background: linear-gradient(to right, var(--freelancer-secondary), rgba(var(--freelancer-secondary-rgb), 0.8));
        }
      `}</style>
    </div>
  );
};

export default UpcomingEvents;