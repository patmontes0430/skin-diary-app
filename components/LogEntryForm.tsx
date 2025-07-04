import * as React from 'react';
import { LogEntry } from '../types';

interface LogEntryFormProps {
  onAddLog: (log: Omit<LogEntry, 'id'>) => void;
  onUpdateLog: (log: LogEntry) => void;
  editingLog: LogEntry | null;
  onCancelEdit: () => void;
}

const StarRating: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`fa-solid fa-star cursor-pointer text-2xl ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );
};

const LogEntryForm: React.FC<LogEntryFormProps> = ({ onAddLog, onUpdateLog, editingLog, onCancelEdit }) => {
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [food, setFood] = React.useState('');
  const [supplements, setSupplements] = React.useState('');
  const [intakeTime, setIntakeTime] = React.useState('');
  const [water, setWater] = React.useState(8);
  const [skinReaction, setSkinReaction] = React.useState('');
  const [reactionTime, setReactionTime] = React.useState('');
  const [skinRating, setSkinRating] = React.useState(3);
  const [photo, setPhoto] = React.useState<string | undefined>(undefined);
  const [showForm, setShowForm] = React.useState(false);

  React.useEffect(() => {
    if (editingLog) {
      setDate(editingLog.date);
      setFood(editingLog.food);
      setSupplements(editingLog.supplements || '');
      setIntakeTime(editingLog.intakeTime || '');
      setWater(editingLog.water);
      setSkinReaction(editingLog.skinReaction);
      setReactionTime(editingLog.reactionTime || '');
      setSkinRating(editingLog.skinRating);
      setPhoto(editingLog.photo);
      setShowForm(true); // Show the form when editing starts
    }
  }, [editingLog]);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setFood('');
    setSupplements('');
    setIntakeTime('');
    setWater(8);
    setSkinReaction('');
    setReactionTime('');
    setSkinRating(3);
    setPhoto(undefined);
    setShowForm(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isIntakeLogged = food.trim() !== '' || supplements.trim() !== '';

    if (!isIntakeLogged) {
      alert("Please log either the food/drink you had, or any supplements/medicine you took.");
      return;
    }

    if (!skinReaction.trim()) {
      alert("Please describe how your skin is today.");
      return;
    }
    
    if (editingLog) {
        onUpdateLog({
            ...editingLog,
            date, food, water, skinReaction, skinRating, photo, supplements, intakeTime, reactionTime
        });
    } else {
        onAddLog({ date, food, water, skinReaction, skinRating, photo, supplements, intakeTime, reactionTime });
    }

    resetForm();
    onCancelEdit(); // This will clear the editing state in App.tsx
  };
  
  const handleCancel = () => {
      resetForm();
      onCancelEdit();
  }
  
  const isEditing = !!editingLog;

  if (!showForm && !isEditing) {
      return (
          <div className="text-center my-4">
              <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
              >
                  <i className="fa-solid fa-plus mr-2"></i> Add Today's Log
              </button>
          </div>
      )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border-2 border-teal-500" id="log-form">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">{isEditing ? 'Edit Log Entry' : 'New Log Entry'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
        </div>

        <div>
            <label htmlFor="food" className="block text-sm font-medium text-slate-700 mb-1">What did you eat or drink today?</label>
            <textarea id="food" value={food} onChange={(e) => setFood(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Oatmeal with berries, Coffee, Chicken salad..."></textarea>
        </div>

        <div>
            <label htmlFor="supplements" className="block text-sm font-medium text-slate-700 mb-1">Vitamins, Medicine, or Supplements Taken</label>
            <textarea 
                id="supplements" 
                value={supplements} 
                onChange={(e) => setSupplements(e.target.value)} 
                rows={3} 
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" 
                placeholder="e.g., Vitamin D, Probiotic, Allergy pill..."
            ></textarea>
        </div>

        <div>
            <label htmlFor="intakeTime" className="block text-sm font-medium text-slate-700 mb-1">Time of Intake (Food/Supplements) (optional)</label>
            <input type="time" id="intakeTime" value={intakeTime} onChange={(e) => setIntakeTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">How much water? (in glasses)</label>
            <div className="flex items-center space-x-4">
                <button type="button" onClick={() => setWater(w => Math.max(0, w-1))} className="bg-slate-200 h-8 w-8 rounded-full font-bold text-slate-600">-</button>
                <span className="font-semibold text-lg">{water}</span>
                <button type="button" onClick={() => setWater(w => w+1)} className="bg-slate-200 h-8 w-8 rounded-full font-bold text-slate-600">+</button>
            </div>
        </div>

        <div>
            <label htmlFor="skinReaction" className="block text-sm font-medium text-slate-700 mb-1">How is your skin today?</label>
            <textarea id="skinReaction" value={skinReaction} onChange={(e) => setSkinReaction(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Less red on cheeks, Itchy patch on arm, Feeling smooth..."></textarea>
        </div>

         <div>
            <label htmlFor="reactionTime" className="block text-sm font-medium text-slate-700 mb-1">Time of Skin Reaction (optional)</label>
            <input type="time" id="reactionTime" value={reactionTime} onChange={(e) => setReactionTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Overall Skin Rating</label>
          <StarRating rating={skinRating} setRating={setSkinRating} />
        </div>

        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-slate-700 mb-1">Add a photo (optional)</label>
          <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
          {photo && <img src={photo} alt="Skin preview" className="mt-4 rounded-md h-32 w-32 object-cover"/>}
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-300">{isEditing ? 'Update Log' : 'Save Log'}</button>
          <button type="button" onClick={handleCancel} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md shadow-sm transition duration-300">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default LogEntryForm;
