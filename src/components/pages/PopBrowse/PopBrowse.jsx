import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "../../Calendar/Calendar";
import {
  PopBrowseContainer,
  PopBrowseWrapper,
  PopBrowseBlock,
  PopBrowseContent,
  PopBrowseTopBlock,
  PopBrowseTitle,
  CategoryTheme,
  PopBrowseStatus,
  StatusTitle,
  StatusThemes,
  StatusTheme,
  PopBrowseWrap,
  PopBrowseForm,
  FormBrowseBlock,
  FormBrowseArea,
  ButtonGroup,
  Button,
  ThemeDown,
  Subtitle,
} from "./PopBrowse.styles";
import { kanbanAPI } from "../../../services/api";

const PopBrowse = ({ tasks, onClose }) => {
  const { id } = useParams();
  const task = tasks?.find((task) => task._id === id);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "Без статуса",
    topic: task?.topic || "Research",
    date: task?.date ? new Date(task.date) : new Date(),
  });

  // Функция для получения заглушки токена (обход авторизации)
  const getDummyToken = () => {
    // Пробуем получить реальный токен из localStorage
    const realToken = localStorage.getItem("userToken");
    if (realToken) return realToken;
    
    // Если нет реального токена, используем заглушку
    return "dummy-token-" + Date.now();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const dateToSend =
        editedTask.date instanceof Date
          ? editedTask.date.toISOString()
          : new Date(editedTask.date).toISOString();

      const taskData = {
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        topic: editedTask.topic,
        date: dateToSend,
      };

      // Используем заглушку токена для обхода авторизации
      const dummyToken = getDummyToken();

      await kanbanAPI.updateTask({
        token: dummyToken,
        id: task._id,
        task: taskData,
      });

      console.log("Задача успешно сохранена!");
      setIsEditMode(false);

      if (onClose) onClose();
      
      // Обновляем страницу для отображения изменений
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      
      // Если ошибка 401, пробуем другой подход
      if (error.message.includes("401") || error.response?.status === 401) {
        alert("Сервер требует авторизацию. Изменения не сохранены.");
      } else {
        alert("Ошибка: " + (error.message || "Не удалось сохранить изменения"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedTask({
      title: task.title,
      description: task.description,
      status: task.status,
      topic: task.topic,
      date: task.date ? new Date(task.date) : new Date(),
    });
  };

  const handleStatusChange = (status) => {
    console.log("Выбран статус:", status);
    setEditedTask((prev) => ({ ...prev, status }));
  };

  const handleDateChange = (date) => {
    setEditedTask((prev) => ({ ...prev, date }));
  };

  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить эту задачу?")) {
      try {
        // Используем заглушку токена для обхода авторизации
        const dummyToken = getDummyToken();

        await kanbanAPI.deleteTask({ 
          token: dummyToken, 
          id: task._id 
        });
        
        if (onClose) onClose();
        
        // Обновляем страницу для отображения изменений
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (error) {
        console.error("Ошибка при удалении:", error);
        
        // Если ошибка 401
        if (error.message.includes("401") || error.response?.status === 401) {
          alert("Сервер требует авторизацию. Удаление невозможно.");
        } else {
          alert("Не удалось удалить задачу: " + (error.message || "Ошибка удаления"));
        }
      }
    }
  };

  // Получаем категории из задач
  const categoryOptions =
    tasks && tasks.length > 0
      ? [...new Set(tasks.map((task) => task.topic))]
      : ["Web Design", "Research", "Copywriting"];

  if (!task) return null;

  const statusOptions = [
    "Без статуса",
    "Нужно сделать",
    "В работе",
    "Тестирование",
    "Готово",
  ];

  return (
    <PopBrowseContainer id="popBrowse">
      <PopBrowseWrapper>
        <PopBrowseBlock>
          <PopBrowseContent>
            <PopBrowseTopBlock>
              {isEditMode ? (
                <input
                  type="text"
                  name="title"
                  value={editedTask.title}
                  onChange={handleChange}
                  className="edit-title-input"
                  placeholder="Название задачи"
                />
              ) : (
                <PopBrowseTitle>{task.title}</PopBrowseTitle>
              )}
              <CategoryTheme $orange className="_active-category">
                <p>
                  {isEditMode ? (
                    <select
                      name="topic"
                      value={editedTask.topic}
                      onChange={handleChange}
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  ) : (
                    task.topic
                  )}
                </p>
              </CategoryTheme>
            </PopBrowseTopBlock>

            <PopBrowseStatus>
              <StatusTitle>Статус</StatusTitle>
              <StatusThemes>
                {statusOptions.map((status) => (
                  <StatusTheme
                    key={status}
                    className={`
                      ${status === editedTask.status ? "_active" : ""}
                      ${status === "Нужно сделать" ? "_gray" : ""}
                    `}
                    onClick={() => isEditMode && handleStatusChange(status)}
                    style={{
                      cursor: isEditMode ? "pointer" : "default",
                      opacity: isEditMode ? 1 : 0.6,
                    }}
                  >
                    <p>{status}</p>
                  </StatusTheme>
                ))}
              </StatusThemes>
            </PopBrowseStatus>

            <PopBrowseWrap>
              <PopBrowseForm id="formBrowseCard">
                <FormBrowseBlock>
                  <Subtitle htmlFor="textArea01">Описание задачи</Subtitle>
                  <FormBrowseArea
                    name="description"
                    id="textArea01"
                    readOnly={!isEditMode}
                    value={
                      isEditMode ? editedTask.description : task.description
                    }
                    onChange={handleChange}
                    placeholder="Введите описание задачи..."
                  />
                </FormBrowseBlock>
              </PopBrowseForm>
              <Calendar
                selectedDate={editedTask.date}
                onDateChange={isEditMode ? handleDateChange : null}
              />
            </PopBrowseWrap>

            <ThemeDown>
              <Subtitle>Категория</Subtitle>
              <CategoryTheme $orange className="_active-category">
                <p>{task.topic}</p>
              </CategoryTheme>
            </ThemeDown>

            <ButtonGroup>
              {!isEditMode ? (
                <>
                  <Button $border onClick={handleEdit}>
                    Редактировать задачу
                  </Button>
                  <Button $border onClick={handleDelete}>
                    Удалить задачу
                  </Button>
                  <Button $background onClick={onClose}>
                    Закрыть
                  </Button>
                </>
              ) : (
                <>
                  <Button $background onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Сохранение..." : "Сохранить"}
                  </Button>
                  <Button $border onClick={handleCancel}>
                    Отменить
                  </Button>
                  <Button $border onClick={handleDelete}>
                    Удалить задачу
                  </Button>
                  <Button $background onClick={onClose}>
                    Закрыть
                  </Button>
                </>
              )}
            </ButtonGroup>

            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: '#e3f2fd', 
              border: '1px solid #bbdefb',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              <p style={{ color: '#1565c0', margin: 0 }}>
                ⚠️ Режим разработки: используется временный токен для тестирования
              </p>
            </div>
          </PopBrowseContent>
        </PopBrowseBlock>
      </PopBrowseWrapper>
    </PopBrowseContainer>
  );
};

export default PopBrowse;