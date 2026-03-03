import React, { useState } from 'react';
import './RequestForm.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function RequestForm({ profile, ayudas = [], onClose, onSubmitted }) {
  const [formFields, setFormFields] = useState({
    nombre: profile?.nombre || '',
    email: profile?.email || '',
    cedula: profile?.cedula || '',
    telefono: profile?.telefono || '',
    direccion: profile?.direccion || ''
  });
  const [selectedAyuda, setSelectedAyuda] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = (e) => setSelectedFiles(Array.from(e.target.files || []));
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = (e) => { e.preventDefault(); e.stopPropagation(); const dt = e.dataTransfer; if (!dt) return; const files = Array.from(dt.files || []); if (files.length) setSelectedFiles(prev => prev.concat(files)); };
  const removeFile = (idx) => setSelectedFiles(prev => prev.filter((_, i) => i !== idx));

  const submitSolicitud = (e) => {
    e && e.preventDefault();
    if (!selectedAyuda) return alert('Selecciona una convocatoria');
    setUploading(true); setProgress(0);
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('nombre', formFields.nombre || profile.nombre);
      form.append('email', formFields.email || profile.email);
      form.append('cedula', formFields.cedula || profile.cedula || '');
      form.append('telefono', formFields.telefono || profile.telefono || '');
      form.append('direccion', formFields.direccion || profile.direccion || '');
      form.append('ayuda_id', selectedAyuda);
      selectedFiles.forEach((f) => form.append('files', f));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/solicitar`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (event) => { if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100)); };
      xhr.onload = async () => {
        setUploading(false); setProgress(100);
        try {
          const res = JSON.parse(xhr.responseText || '{}');
          if (res.error) {
            alert(res.error || 'Error al enviar solicitud');
          } else {
            alert(res.mensaje || 'Solicitud enviada');
            setSelectedFiles([]);
            onSubmitted && onSubmitted();
            onClose && onClose();
          }
        } catch (err) {
          console.error('Respuesta inválida', err);
          alert('Respuesta inválida del servidor');
        }
        setTimeout(() => setProgress(0), 700);
      };
      xhr.onerror = () => { setUploading(false); alert('Error al conectar con el servidor'); };
      xhr.send(form);
    } catch (err) {
      console.error(err); setUploading(false); alert('Error al procesar la solicitud');
    }
  };

  return (
    <div>
      <form onSubmit={submitSolicitud} className="upload-input">
        <div>
          <div className="input-label">Nombre</div>
          <input className="text-input" value={formFields.nombre} onChange={e=>setFormFields({...formFields,nombre:e.target.value})} />
        </div>
        <div>
          <div className="input-label">Correo</div>
          <input className="text-input" value={formFields.email} onChange={e=>setFormFields({...formFields,email:e.target.value})} />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <div>
            <div className="input-label">Cédula</div>
            <input className="text-input" value={formFields.cedula} onChange={e=>setFormFields({...formFields,cedula:e.target.value})} />
          </div>
          <div>
            <div className="input-label">Teléfono</div>
            <input className="text-input" value={formFields.telefono} onChange={e=>setFormFields({...formFields,telefono:e.target.value})} />
          </div>
        </div>
        <div>
          <div className="input-label">Dirección</div>
          <input className="text-input" value={formFields.direccion} onChange={e=>setFormFields({...formFields,direccion:e.target.value})} />
        </div>

        <div>
          <div className="input-label">Convocatoria</div>
          <select className="select-input" value={selectedAyuda} onChange={e=>setSelectedAyuda(e.target.value)} required>
            <option value="">-- Selecciona --</option>
            {ayudas.map(a=> (<option key={a.id} value={a.id}>{a.titulo}</option>))}
          </select>
        </div>

        <div>
          <div className="input-label">Documentos (PDF/JPG)</div>
          <div className="dropzone" onDragOver={onDragOver} onDrop={onDrop}>
            Arrastra y suelta archivos aquí, o haz clic para elegir
            <input type="file" multiple onChange={handleFiles} style={{display:'block',marginTop:8}} />
          </div>
        </div>

        {selectedFiles.length>0 && (
          <div className="file-preview">{selectedFiles.map((f,i)=>(
            <div key={i} className="file-item"><div style={{fontSize:13}}>{f.name}</div><button type="button" className="file-remove" onClick={()=>removeFile(i)}>Eliminar</button></div>
          ))}</div>
        )}

        {progress>0 && (<div className="upload-progress"><span style={{width:`${progress}%`}}></span></div>)}

        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="primary-btn" type="submit" disabled={uploading}>{uploading?`Enviando (${progress}%)`:'Enviar solicitud'}</button>
          <button type="button" className="btn secondary" onClick={()=>onClose && onClose()}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
