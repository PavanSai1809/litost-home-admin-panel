import React, { useState, useEffect } from 'react';

interface ContactDetail {
  id: number;
  section_id: number;
  contact_type: string;
  contactType: string;
  value: string;
  created_at: string;
  updated_at: string;
}

const ContactDetails: React.FC = () => {
  const [details, setDetails] = useState<ContactDetail[]>([]);
  const [newDetail, setNewDetail] = useState({ contact_type: '', value: '', section_id: 5 });
  const [editingDetail, setEditingDetail] = useState<ContactDetail | null>(null);
  const [formErrors, setFormErrors] = useState({ contact_type: '', value: '' });
  const [isOpen, setIsOpen] = useState(false);

  const fetchDetails = async () => {
    try {
      const sectionId = 5;
      const response = await fetch(`http://localhost:4002/api/v1/section/footer/${sectionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contact details');
      }
      const data = await response.json();
      setDetails(data.result.contact_details);
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const validateFields = () => {
    const errors: { contact_type: string; value: string } = { contact_type: '', value: '' };
    if (!newDetail.contact_type.trim()) errors.contact_type = 'Contact type is required';
    if (!newDetail.value.trim()) errors.value = 'Value is required';
    setFormErrors(errors);
    return Object.values(errors).every((error) => error === '');
  };

  const handleAddDetail = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch('http://localhost:4002/api/v1/section/createContactDetail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDetail),
      });

      if (!response.ok) {
        throw new Error('Error adding contact detail');
      }

      fetchDetails();
      setNewDetail({ section_id: 5, contact_type: '', value: '' });
    } catch (error) {
      console.error('Error adding contact detail:', error);
    }
  };

  const handleEditDetail = (detail: ContactDetail) => {
    setEditingDetail(detail);
    setNewDetail({ section_id: 5, contact_type: detail.contactType, value: detail.value });
  };

  const handleSaveEditDetail = async () => {
    if (!validateFields() || !editingDetail) return;

    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/section/updateContactDetail/${editingDetail.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newDetail),
        }
      );

      if (!response.ok) {
        throw new Error('Error updating contact detail');
      }

      fetchDetails();
      setEditingDetail(null);
      setNewDetail({ section_id: 5, contact_type: '', value: '' });
    } catch (error) {
      console.error('Error updating contact detail:', error);
    }
  };

  const handleDeleteDetail = async (detailId: number) => {
    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/section/deleteContactDetail/${detailId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Error deleting contact detail');
      }

      fetchDetails();
    } catch (error) {
      console.error('Error deleting contact detail:', error);
    }
  };

  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200 container mx-auto p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-gray-800">Footer - Contact Details</h2>
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
            {details.length === 0 ? (
              <p className="text-gray-500 mt-3">No contact details available.</p>
            ) : (
              details.map((detail) => (
                <div key={detail.id} className="flex justify-between items-center py-4 border-b border-gray-300">
                  <div>
                    <p className="text-xl font-medium text-gray-800">{detail.contactType}</p>
                    <p className="text-sm text-gray-600">{detail.value}</p>
                  </div>
                  <div className="space-x-4">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditDetail(detail)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteDetail(detail.id)}
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
              {editingDetail ? 'Edit Contact Detail' : 'Add New Contact Detail'}
            </h4>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Contact Type"
                value={newDetail.contact_type}
                onChange={(e) => setNewDetail({ ...newDetail, contact_type: e.target.value })}
                className="border border-gray-300 rounded-lg p-3 w-full mb-4"
              />
              {formErrors.contact_type && (
                <p className="text-red-600 text-sm">{formErrors.contact_type}</p>
              )}
              <input
                type="text"
                placeholder="Value"
                value={newDetail.value}
                onChange={(e) => setNewDetail({ ...newDetail, value: e.target.value })}
                className="border border-gray-300 rounded-lg p-3 w-full mb-4"
              />
              {formErrors.value && <p className="text-red-600 text-sm">{formErrors.value}</p>}
              <button
                onClick={editingDetail ? handleSaveEditDetail : handleAddDetail}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                {editingDetail ? 'Save Changes' : 'Add Contact Detail'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContactDetails;
