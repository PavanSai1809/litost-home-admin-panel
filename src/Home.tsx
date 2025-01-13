import React, { useState, useEffect } from 'react';
import SocialMedia from './SocialLinks';
import ContactDetails from './ContactDetails';

interface SectionContent {
  id: number;
  section_id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Section {
  id: number;
  sectionName: string;
  isVisible: boolean;
  displayOrder: number;
  content: SectionContent[];
}

const SectionCard: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [newContent, setNewContent] = useState({ title: '', description: '' });
  const [editingContent, setEditingContent] = useState<SectionContent | null>(null);
  const [formErrors, setFormErrors] = useState({ title: '', description: '' });

  const [openSections, setOpenSections] = useState<{ [key: number]: boolean }>({});

  const fetchSections = async () => {
    try {
      const response = await fetch('http://localhost:4002/api/v1/section/sections');
      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }
      const data = await response.json();
      setSections(data.result);
    } catch (error) {
      console.error('Error fetching sections', error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const validateFields = () => {
    const errors: { title: string; description: string } = { title: '', description: '' };
    if (!newContent.title.trim()) errors.title = 'Title is required';
    if (!newContent.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.values(errors).every((error) => error === '');
  };

  const handleAddContent = async (sectionId: number) => {
    if (!validateFields()) return;
  
    const newSectionContent = {
      ...newContent,
      section_id: sectionId,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  
    setSections((prev) => {
      return prev.map((section) =>
        section.id === sectionId
          ? { ...section, content: [...section.content, newSectionContent] }
          : section
      );
    });
  
    try {
      const response = await fetch('http://localhost:4002/api/v1/section/createSectionContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_id: sectionId,
          ...newContent,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error adding content');
      }

      await fetchSections();
  
      const newContentData = await response.json();
  
      setSections((prev) => {
        return prev.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                content: section.content.map((content) =>
                  content.id === newSectionContent.id ? { ...newContentData, id: newContentData.id } : content
                ),
              }
            : section
        );
      });
  
      setNewContent({ title: '', description: '' });
      setFormErrors({ title: '', description: '' });
    } catch (error) {
      console.error('Error adding content', error);
      setSections((prev) => {
        return prev.map((section) =>
          section.id === sectionId
            ? { ...section, content: section.content.filter((content) => content.id !== newSectionContent.id) }
            : section
        );
      });
    }
  };
  
  
  
  

  const handleEditContent = (content: SectionContent) => {
    setEditingContent(content);
    setNewContent({ title: content.title, description: content.description });
  };

  const handleSaveEditContent = async (sectionId: number) => {
    if (!validateFields()) return;
  
    if (editingContent) {
      setSections((prev) => {
        const updatedSections = prev.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                content: section.content.map((item) =>
                  item.id === editingContent.id
                    ? { ...item, title: newContent.title, description: newContent.description }
                    : item
                ),
              }
            : section
        );
        return updatedSections;
      });
  
      try {
        const response = await fetch(`http://localhost:4002/api/v1/section/updateSectionContent/${editingContent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section_id: sectionId,
            ...newContent,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Error updating content');
        }

        await fetchSections();
  
        const updatedContent = await response.json();
  
        setSections((prev) => {
          const updatedSections = prev.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  content: section.content.map((item) =>
                    item.id === updatedContent.id ? updatedContent : item
                  ),
                }
              : section
          );
          return updatedSections;
        });
  
        setEditingContent(null);
        setNewContent({ title: '', description: '' });
        setFormErrors({ title: '', description: '' });
      } catch (error) {
        console.error('Error updating content', error);
      }
    }
  };
  

  const handleDeleteContent = async (sectionId: number, contentId: number) => {
    try {
      const response = await fetch(`http://localhost:4002/api/v1/section/deleteSectionContent/${contentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error deleting content');
      }

      setSections((prev) => {
        const updatedSections = prev.map((section) =>
          section.id === sectionId
            ? { ...section, content: section.content.filter((item) => item.id !== contentId) }
            : section
        );
        return updatedSections;
      });
    } catch (error) {
      console.error('Error deleting content', error);
    }
  };

  const toggleSectionVisibility = (sectionId: number) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [sectionId]: !prevState[sectionId],
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Panel</h1>

      {sections.map((section) => (
        <div key={section.id} className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-gray-800">
              {section.sectionName}
            </h2>
            <span
              onClick={() => toggleSectionVisibility(section.id)}
              className="cursor-pointer text-2xl text-gray-600 hover:text-gray-800"
            >
              {openSections[section.id] ? '▲' : '▼'}
            </span>
          </div>

          {openSections[section.id] && (
            <>
              <p className="text-sm text-gray-400 mt-2">Display Order: {section.displayOrder}</p>

              <div className="mt-6">
                <h3 className="text-2xl font-semibold text-gray-700">Content</h3>
                {section.content.length === 0 ? (
                  <p className="text-gray-500 mt-3">No content available.</p>
                ) : (
                  section.content.map((content) => (
                    <div key={content.id} className="flex justify-between items-center py-4 border-b border-gray-300">
                      <div>
                        <p className="text-xl font-medium text-gray-800">{content.title}</p>
                        <p className="text-sm text-gray-600">{content.description}</p>
                      </div>
                      <div className="space-x-4">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEditContent(content)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteContent(section.id, content.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8">
                <h4 className="text-xl font-semibold text-gray-700">
                  {editingContent ? 'Edit Content' : 'Add New Content'}
                </h4>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newContent.title}
                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                    className="border border-gray-300 rounded-lg p-3 w-full mb-4"
                  />
                  {formErrors.title && <p className="text-red-600 text-sm">{formErrors.title}</p>}
                  <textarea
                    placeholder="Description"
                    value={newContent.description}
                    onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                    className="border border-gray-300 rounded-lg p-3 w-full mb-4"
                  />
                  {formErrors.description && <p className="text-red-600 text-sm">{formErrors.description}</p>}
                  <button
                    onClick={() =>
                      editingContent ? handleSaveEditContent(section.id) : handleAddContent(section.id)
                    }
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    {editingContent ? 'Save Changes' : 'Add Content'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
      <SocialMedia/>
      <ContactDetails/>
    </div>
  );
};

export default SectionCard;
