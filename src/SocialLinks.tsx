import React, { useState, useEffect } from 'react';

interface SocialMediaLink {
  id: number;
  section_id: number;
  platform_name: string;
  platformName: string;
  url: string;
  created_at: string;
  updated_at: string;
}

const SocialMediaLinks: React.FC = () => {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [newLink, setNewLink] = useState({ platform_name: '', url: '', section_id: 5 });
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [formErrors, setFormErrors] = useState({ platform_name: '', url: '' });
  const [isOpen, setIsOpen] = useState(true);

  const fetchLinks = async () => {
    try {
        const sectionId =5;
      const response = await fetch(`http://localhost:4002/api/v1/section/footer/${sectionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch links');
      }
      const data = await response.json();
      setLinks(data.result.social_media_links);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const validateFields = () => {
    const errors: { platform_name: string; url: string } = { platform_name: '', url: '' };
    if (!newLink.platform_name.trim()) errors.platform_name = 'Platform name is required';
    if (!newLink.url.trim()) errors.url = 'URL is required';
    setFormErrors(errors);
    return Object.values(errors).every((error) => error === '');
  };

  const handleAddLink = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch('http://localhost:4002/api/v1/section/createSocialMedia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLink),
      });

      if (!response.ok) {
        throw new Error('Error adding link');
      }

      fetchLinks();
      setNewLink({ section_id: 5, platform_name: '', url: '' });
    } catch (error) {
      console.log(error, 'trete')
      console.error('Error adding link:', error);
    }
  };

  const handleEditLink = (link: SocialMediaLink) => {
    setEditingLink(link);
    setNewLink({ section_id: 5, platform_name: link.platformName, url: link.url });
  };

  const handleSaveEditLink = async () => {
    if (!validateFields() || !editingLink) return;

    try {
      const response = await fetch(`http://localhost:4002/api/v1/section/updateSocialMedia/${editingLink.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLink),
      });

      if (!response.ok) {
        throw new Error('Error updating link');
      }

      fetchLinks();
      setEditingLink(null);
      setNewLink({ section_id : 5, platform_name: '', url: '' });
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    try {
      const response = await fetch(`http://localhost:4002/api/v1/section/deleteSocialMedia/${linkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error deleting link');
      }

      fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
      <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200 container mx-auto p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-gray-800">Social Media Links</h2>
          <span
            onClick={toggleVisibility}
            className="cursor-pointer text-2xl text-gray-600 hover:text-gray-800"
          >
            {isOpen ? '▲' : '▼'}
          </span>
        </div>

        {isOpen && (
          <>
            <div className="mt-6">
              <h3 className="text-2xl font-semibold text-gray-700">Content</h3>
              {links.length === 0 ? (
                <p className="text-gray-500 mt-3">No links available.</p>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="flex justify-between items-center py-4 border-b border-gray-300">
                    <div>
                      <p className="text-xl font-medium text-gray-800">{link.platformName}</p>
                      <p className="text-sm text-gray-600">{link.url}</p>
                    </div>
                    <div className="space-x-4">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditLink(link)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteLink(link.id)}
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
                {editingLink ? 'Edit Link' : 'Add New Link'}
              </h4>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Platform Name"
                  value={newLink.platform_name}
                  onChange={(e) => setNewLink({ ...newLink, platform_name: e.target.value })}
                  className="border border-gray-300 rounded-lg p-3 w-full mb-4"
                />
                {formErrors.platform_name && <p className="text-red-600 text-sm">{formErrors.platform_name}</p>}
                <input
                  type="text"
                  placeholder="URL"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="border border-gray-300 rounded-lg p-3 w-full mb-4"
                />
                {formErrors.url && <p className="text-red-600 text-sm">{formErrors.url}</p>}
                <button
                  onClick={editingLink ? handleSaveEditLink : handleAddLink}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  {editingLink ? 'Save Changes' : 'Add Link'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
  );
};

export default SocialMediaLinks;
